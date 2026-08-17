import { useEffect, useState } from 'react';
import { showTrackPlayVisits } from '@/lib/catalogPlays';
import { usePlaybackStore } from '@/stores/playbackStore';

/** Keep the bottom-right Visits mark = global plays for the current track (all listeners). */
export function useTrackPlayVisits() {
  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const [plays, setPlays] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void showTrackPlayVisits(currentTrackId).then((n) => {
      if (!cancelled) setPlays(n);
    });
    return () => {
      cancelled = true;
    };
  }, [currentTrackId]);

  return plays;
}
