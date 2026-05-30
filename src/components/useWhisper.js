import { useState, useRef, useCallback } from 'react';

let _transcriber = null;
let _loadPromise = null;

async function getTranscriber(onProgress) {
  if (_transcriber) return _transcriber;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const { pipeline, env } = await import('@xenova/transformers');
    env.allowLocalModels = false;
    const t = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny.en',
      { progress_callback: onProgress }
    );
    _transcriber = t;
    _loadPromise = null;
    return t;
  })();

  return _loadPromise;
}

const HALLUCINATIONS = /^\s*(\[.*?\]|\(.*?\)|thanks?\.?|you\.?|thank you\.?|\.+|uh+|um+)\s*$/i;

function bestMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ];
  return candidates.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

function rms(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i] * arr[i];
  return Math.sqrt(sum / arr.length);
}

// Boost quiet audio to a target RMS level, clamped to [-1, 1]
function amplifyToTarget(arr, targetRms = 0.15) {
  const level = rms(arr);
  if (level < 0.00001) return arr; // completely silent — don't touch
  const gain = Math.min(targetRms / level, 12); // up to 12× boost, never clip
  const out = new Float32Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = Math.max(-1, Math.min(1, arr[i] * gain));
  }
  return out;
}

export function useWhisper({ onResult, onError }) {
  const [state, setState]     = useState('idle');
  const [loadPct, setLoadPct] = useState(0);
  const recorderRef   = useRef(null);
  const chunksRef     = useRef([]);
  const streamRef     = useRef(null);
  const audioCtxRef   = useRef(null);
  const analyserRef   = useRef(null);
  const startTimeRef  = useRef(0);

  const start = useCallback(async () => {
    setState('loading');

    let transcriber;
    try {
      transcriber = await getTranscriber((p) => {
        if (p.status === 'progress' && typeof p.progress === 'number') {
          setLoadPct(Math.round(p.progress));
        }
      });
    } catch {
      setState('idle');
      onError('Failed to load voice model.');
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 16000 },
        },
        video: false,
      });
    } catch {
      setState('idle');
      onError('Microphone access denied.');
      return;
    }

    streamRef.current   = stream;
    chunksRef.current   = [];
    startTimeRef.current = Date.now();

    // ── Audio graph ──────────────────────────────────────────────
    // source → gain (4×) → analyser → dest (recorded)
    //                     ↘ (also feeds analyser for visualizer)
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const source  = audioCtx.createMediaStreamSource(stream);

    // Pre-amplify the mic signal before recording — this is the key fix.
    // The MediaRecorder gets the boosted stream, so Whisper sees a strong signal.
    const gain    = audioCtx.createGain();
    gain.gain.value = 4;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    analyserRef.current = analyser;

    // MediaStreamDestinationNode lets us record the processed audio
    const dest = audioCtx.createMediaStreamDestination();

    source.connect(gain);
    gain.connect(analyser);
    gain.connect(dest);

    const mimeType = bestMimeType();
    // Record from the amplified destination stream, not the raw mic stream
    const recorder = new MediaRecorder(dest.stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      analyserRef.current = null;
      audioCtxRef.current?.close();
      setState('transcribing');

      try {
        const usedMime  = recorder.mimeType || mimeType || 'audio/webm';
        const blob      = new Blob(chunksRef.current, { type: usedMime });

        if (blob.size < 500) {
          onError('Recording too short — hold the button and speak.');
          setState('idle');
          return;
        }

        const arrayBuffer = await blob.arrayBuffer();

        // Decode at exactly 16 kHz (Whisper's expected sample rate)
        let float32;
        try {
          const decodeCtx  = new AudioContext({ sampleRate: 16000 });
          const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
          await decodeCtx.close();
          float32 = audioBuffer.getChannelData(0);
        } catch {
          // Fallback: decode at native rate then resample offline
          const fallback  = new AudioContext();
          const rawBuf    = await fallback.decodeAudioData(arrayBuffer.slice(0));
          const frames    = Math.ceil(rawBuf.duration * 16000);
          const offline   = new OfflineAudioContext(1, frames, 16000);
          const src       = offline.createBufferSource();
          src.buffer      = rawBuf;
          src.connect(offline.destination);
          src.start(0);
          const resampled = await offline.startRendering();
          await fallback.close();
          float32 = resampled.getChannelData(0);
        }

        // Boost quiet speech to a consistent level before handing to Whisper
        const boosted = amplifyToTarget(float32);

        const output = await transcriber(boosted, {
          language: 'english',
          task: 'transcribe',
          num_beams: 2,
          return_timestamps: false,
          // Lower Whisper's own silence gate — default 0.6 is too aggressive
          no_speech_threshold: 0.2,
          // Allow lower-confidence output through
          logprob_threshold: -2.0,
        });

        const text = (output.text || '').trim();

        if (!text || HALLUCINATIONS.test(text)) {
          onError('Couldn\'t make that out — try speaking a bit slower or closer.');
          setState('idle');
          return;
        }

        onResult(text);
      } catch {
        onError('Transcription failed — please try again.');
      } finally {
        setState('idle');
      }
    };

    recorder.start(200);
    setState('recording');
  }, [onResult, onError]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (state === 'recording') stop();
    else if (state === 'idle') start();
  }, [state, start, stop]);

  return { state, loadPct, toggle, analyserRef };
}
