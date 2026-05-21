import { useEffect, useRef } from 'react';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';

/**
 * Background audio element lives at app root so OS screensaver / route remounts
 * do not destroy an in-progress handoff stream.
 */
export function PlaybackKeepAlive() {
  const backgroundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = backgroundRef.current;
    registerPlaybackMedia(null, el);
    return () => registerPlaybackMedia(null, null);
  }, []);

  return (
    <audio
      ref={backgroundRef}
      className="sr-only"
      preload="auto"
      playsInline
      aria-hidden
      data-qv-playback-keepalive
    />
  );
}
