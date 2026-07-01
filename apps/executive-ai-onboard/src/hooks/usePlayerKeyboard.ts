import { useEffect } from 'react';

interface Handlers {
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  enabled?: boolean;
}

export function usePlayerKeyboard({ onPlayPause, onPrev, onNext, enabled = true }: Handlers) {
  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, onPlayPause, onPrev, onNext]);
}
