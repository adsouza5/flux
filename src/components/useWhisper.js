import { useState, useRef, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SUPPORTED = !!SpeechRecognition;

export function useWhisper({ onResult, onError }) {
  const [state, setState]   = useState('idle');
  const recognitionRef      = useRef(null);
  const audioCtxRef         = useRef(null);
  const streamRef           = useRef(null);
  const analyserRef         = useRef(null);
  const wakeActiveRef       = useRef(false);

  // ── Active recording (single utterance) ─────────────────────────
  const start = useCallback(async () => {
    if (!SUPPORTED) {
      onError('Voice recognition requires Chrome or Edge. Firefox is not supported.');
      return;
    }

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
      if (e.error === 'no-speech')     onError('No speech detected — try speaking closer to the mic.');
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

  // ── Wake word mode — continuous, restarts automatically ──────────
  const launchWakeSession = useCallback(() => {
    if (!wakeActiveRef.current) return;

    const r = new SpeechRecognition();
    r.lang = 'en-US';
    r.continuous = true;
    r.interimResults = false;
    r.maxAlternatives = 1;
    recognitionRef.current = r;

    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) continue;
        const text = e.results[i][0].transcript.trim();
        if (/\bconvert\b/i.test(text)) {
          onResult(text);
          // Stay in wake mode — next "convert" will fire again
        }
      }
    };

    r.onerror = (e) => {
      if (e.error === 'not-allowed') {
        wakeActiveRef.current = false;
        setState('idle');
        onError('Microphone access denied.');
      }
      // no-speech / network errors: just let onend restart it
    };

    // Chrome times out continuous recognition after silence; auto-restart
    r.onend = () => {
      if (wakeActiveRef.current) setTimeout(launchWakeSession, 150);
    };

    try { r.start(); } catch { /* already started */ }
  }, [onResult, onError]);

  const startWake = useCallback(() => {
    if (!SUPPORTED) { onError('Wake word requires Chrome or Edge.'); return; }
    wakeActiveRef.current = true;
    setState('wake');
    launchWakeSession();
  }, [launchWakeSession, onError]);

  const stopWake = useCallback(() => {
    wakeActiveRef.current = false;
    recognitionRef.current?.stop();
    setState('idle');
  }, []);

  const toggleWake = useCallback(() => {
    if (state === 'wake') stopWake();
    else if (state === 'idle') startWake();
  }, [state, startWake, stopWake]);

  return { state, loadPct: 0, toggle, toggleWake, analyserRef };
}
