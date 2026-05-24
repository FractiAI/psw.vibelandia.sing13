import { useCallback } from 'react';
import { bindSimpleAudioElement } from '@/lib/simplePlayback';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';

/** Single app-root audio element — never unmounts (required for iOS + upload tab). */
export function GlobalAudio() {
  const setRef = useCallback((el: HTMLAudioElement | null) => {
    bindSimpleAudioElement(el);
    registerPlaybackMedia(el, null);
  }, []);

  return (
    <div className="sp-global-audio-wrap">
      <audio
        ref={setRef}
        className="sp-global-audio"
        playsInline
        preload="none"
        controls
        aria-label="QUESTFEST audio"
      />
    </div>
  );
}
