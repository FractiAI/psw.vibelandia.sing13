import { useCallback } from 'react';
import { IOS_PLAYABLE_MEDIA_CLASS } from '@/lib/devicePlayback';
import { bindSimpleAudioElement } from '@/lib/simplePlayback';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';

/** App-root <audio> so play() in list taps always has a bound element (iOS / lazy UI). */
export function GlobalAudio() {
  const setRef = useCallback((el: HTMLAudioElement | null) => {
    bindSimpleAudioElement(el);
    registerPlaybackMedia(el, null);
  }, []);

  return (
    <audio
      ref={setRef}
      className={IOS_PLAYABLE_MEDIA_CLASS}
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}
