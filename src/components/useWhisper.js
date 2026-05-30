import { useState, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SUPPORTED = !!SpeechRecognition;

export function useWhisper({ onResult, onError }) {
  const [state, setState]   = useState('idle');
  const recognitionRef      = useRef(null);
  const audioCtxRef         = useRef(null);
  const streamRef           = useRef(null);
  // Exposed for the visualizer
  const analyserRef         = useRef(null);

  const start = useCallback(async () => {
    if (!SUPPORTED) {
      onError('Voice recognition requires Chrome or Edge. Firefox is not supported.');
      return;
    }

    // Grab the mic stream just for the visualizer — Web Speech API handles the transcription
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
    } catch {
      // Visualizer won't animate but transcription still works
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript?.trim();
      if (text) onResult(text);
      else onError('Nothing detected — try again.');
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech')  onError('No speech detected — try speaking closer to the mic.');
      else if (e.error === 'not-allowed') onError('Microphone access denied.');
      else onError(`Recognition error: ${e.error}`);
    };

    recognition.onend = () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      analyserRef.current = null;
      audioCtxRef.current?.close();
      setState('idle');
    };

    recognition.start();
    setState('recording');
  }, [onResult, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const toggle = useCallback(() => {
    if (state === 'recording') stop();
    else if (state === 'idle')  start();
  }, [state, start, stop]);

  // loadPct kept for API compatibility — always 0 with Web Speech API
  return { state, loadPct: 0, toggle, analyserRef };
}
