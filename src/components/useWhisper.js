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

// Whisper hallucinates these on silence / noise — filter them out
const HALLUCINATIONS = /^\s*(\[.*?\]|\(.*?\)|thanks?\.?|you\.?|thank you\.?|\.+)\s*$/i;

// Pick the best supported MIME type for this browser
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

// Normalize float32 audio to [-1, 1] by peak
function normalize(arr) {
  let peak = 0;
  for (let i = 0; i < arr.length; i++) {
    const a = Math.abs(arr[i]);
    if (a > peak) peak = a;
  }
  if (peak > 0.001) {
    const out = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) out[i] = arr[i] / peak;
    return out;
  }
  return arr;
}

// RMS loudness — detect if the recording contains actual sound
function rms(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i] * arr[i];
  return Math.sqrt(sum / arr.length);
}

export function useWhisper({ onResult, onError }) {
  const [state, setState]     = useState('idle');
  const [loadPct, setLoadPct] = useState(0);
  const recorderRef  = useRef(null);
  const chunksRef    = useRef([]);
  const streamRef    = useRef(null);
  const audioCtxRef  = useRef(null);
  const analyserRef  = useRef(null);
  const startTimeRef = useRef(0);

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
          // Request 16 kHz — browsers may honour it or resample
          sampleRate: { ideal: 16000 },
        },
        video: false,
      });
    } catch {
      setState('idle');
      onError('Microphone access denied.');
      return;
    }

    streamRef.current  = stream;
    chunksRef.current  = [];
    startTimeRef.current = Date.now();

    // Wire analyser for the visualizer
    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    audioCtx.createMediaStreamSource(stream).connect(analyser);
    analyserRef.current = analyser;

    const mimeType = bestMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    recorderRef.current = recorder;

    // Collect data every 250 ms so we always have something even on short clips
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      analyserRef.current = null;
      audioCtxRef.current?.close();
      setState('transcribing');

      const duration = Date.now() - startTimeRef.current;

      try {
        const usedMime = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: usedMime });

        if (blob.size < 1000) {
          onError('Recording too short — hold the button and speak clearly.');
          setState('idle');
          return;
        }

        const arrayBuffer = await blob.arrayBuffer();

        // Decode at 16 kHz — the sample rate Whisper expects
        const decodeCtx = new AudioContext({ sampleRate: 16000 });
        let audioBuffer;
        try {
          audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer);
        } catch {
          // Safari / Firefox sometimes need a plain AudioContext for decoding
          const fallbackCtx = new AudioContext();
          const rawBuffer   = await fallbackCtx.decodeAudioData(arrayBuffer.slice(0));
          // Manually resample to 16 kHz
          const offlineCtx  = new OfflineAudioContext(1, Math.ceil(rawBuffer.duration * 16000), 16000);
          const src          = offlineCtx.createBufferSource();
          src.buffer         = rawBuffer;
          src.connect(offlineCtx.destination);
          src.start(0);
          audioBuffer = await offlineCtx.startRendering();
          await fallbackCtx.close();
        } finally {
          await decodeCtx.close().catch(() => {});
        }

        const raw = audioBuffer.getChannelData(0);

        // Sanity check: if RMS is near zero the mic wasn't picking up anything
        if (rms(raw) < 0.001 && duration < 2000) {
          onError('No audio detected — check your microphone level and try again.');
          setState('idle');
          return;
        }

        const float32 = normalize(raw);

        const output = await transcriber(float32, {
          language: 'english',
          task: 'transcribe',
          // Raise the beam width slightly for better accuracy
          num_beams: 2,
          // Suppress timestamp tokens so output is clean text
          return_timestamps: false,
        });

        const text = (output.text || '').trim();

        if (!text || HALLUCINATIONS.test(text)) {
          onError('Couldn\'t make out what you said — try speaking a bit louder or closer to the mic.');
          setState('idle');
          return;
        }

        onResult(text);
      } catch (err) {
        onError('Transcription failed — please try again.');
      } finally {
        setState('idle');
      }
    };

    recorder.start(250); // collect chunks every 250 ms
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
