import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ModulePresentation } from '@/content/presentations';
import { buildNarrationScript } from '@/lib/narrationScript';
import { probeTtsMode, speak, stopSpeaking, type TtsMode } from '@/lib/ttsEngine';

export type BroadcastState = 'idle' | 'playing' | 'paused' | 'ended';

interface Options {
  autoStart?: boolean;
  onEnded?: () => void;
}

export function useNewscastNarration(presentation: ModulePresentation, options: Options = {}) {
  const { autoStart = false, onEnded } = options;
  const segments = useMemo(() => buildNarrationScript(presentation), [presentation]);
  const [index, setIndex] = useState(0);
  const [broadcast, setBroadcast] = useState<BroadcastState>('idle');
  const [ttsMode, setTtsMode] = useState<TtsMode>('idle');
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const current = segments[index] ?? segments[0];
  const progress = segments.length > 1 ? (index / (segments.length - 1)) * 100 : 0;

  useEffect(() => {
    void probeTtsMode().then(setTtsMode);
    return () => {
      runIdRef.current += 1;
      stopSpeaking();
    };
  }, []);

  const playFrom = useCallback(
    async (startIndex: number) => {
      const runId = (runIdRef.current += 1);
      setError(null);

      for (let i = startIndex; i < segments.length; i += 1) {
        if (runId !== runIdRef.current) return;

        setIndex(i);
        setBroadcast('playing');

        try {
          const mode = await speak(segments[i].text);
          if (runId !== runIdRef.current) return;
          setTtsMode(mode);
        } catch {
          if (runId !== runIdRef.current) return;
          setError('Playback paused — press Space or ▶ to resume.');
          setBroadcast('paused');
          return;
        }
      }

      if (runId === runIdRef.current) {
        setBroadcast('ended');
        onEndedRef.current?.();
      }
    },
    [segments],
  );

  const start = useCallback(() => {
    runIdRef.current += 1;
    stopSpeaking();
    setIndex(0);
    void playFrom(0);
  }, [playFrom]);

  const pause = useCallback(() => {
    runIdRef.current += 1;
    stopSpeaking();
    setBroadcast('paused');
  }, []);

  const resume = useCallback(() => {
    void playFrom(index);
  }, [index, playFrom]);

  const togglePlayPause = useCallback(() => {
    if (broadcast === 'idle' || broadcast === 'ended') start();
    else if (broadcast === 'playing') pause();
    else resume();
  }, [broadcast, pause, resume, start]);

  const jump = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(segments.length - 1, i));
      runIdRef.current += 1;
      stopSpeaking();
      setIndex(clamped);
      if (broadcast !== 'idle') void playFrom(clamped);
    },
    [broadcast, playFrom, segments.length],
  );

  const next = useCallback(() => jump(index + 1), [index, jump]);
  const prev = useCallback(() => jump(index - 1), [index, jump]);

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!autoStart || autoStartedRef.current) return;
    autoStartedRef.current = true;
    const t = window.setTimeout(() => start(), 400);
    return () => window.clearTimeout(t);
  }, [autoStart, start]);

  return {
    segments,
    current,
    index,
    progress,
    broadcast,
    ttsMode,
    error,
    start,
    pause,
    resume,
    togglePlayPause,
    jump,
    next,
    prev,
    isSpeaking: broadcast === 'playing',
  };
}

export type NewscastNarration = ReturnType<typeof useNewscastNarration>;
