import { useEffect, useRef } from 'react';
import { IOS_PLAYABLE_MEDIA_CLASS } from '@/lib/devicePlayback';
import { getPlaybackMedia, registerPlaybackMedia } from '@/lib/playbackMediaRegistry';

/**
 * Background audio element lives at app root so OS screensaver / route remounts
 * do not destroy an in-progress handoff stream.
 */
export function PlaybackKeepAlive() {
  const backgroundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = backgroundRef.current;
    if (el) registerPlaybackMedia(getPlaybackMedia().primary, el);
    return () => registerPlaybackMedia(getPlaybackMedia().primary, null);
  }, []);

  return (
    <audio
      ref={backgroundRef}
      className={IOS_PLAYABLE_MEDIA_CLASS}
      preload="auto"
      playsInline
      aria-hidden
      data-qv-playback-keepalive
    />
  );
}
