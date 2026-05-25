import { useCallback } from 'react';
import { bindSimpleAudioElement } from '@/lib/simplePlayback';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';
import { useCatalogStore } from '@/stores/catalogStore';

/** Single app-root audio element — never unmounts; hidden on Upload tab (iOS blue-screen fix). */
export function GlobalAudio() {
  const uploadTab = useCatalogStore((s) => s.djMode);

  const setRef = useCallback((el: HTMLAudioElement | null) => {
    bindSimpleAudioElement(el);
    registerPlaybackMedia(el, null);
  }, []);

  return (
    <div className={`sp-global-audio-wrap${uploadTab ? ' sp-global-audio-wrap--upload' : ''}`}>
      <audio
        ref={setRef}
        className="sp-global-audio"
        playsInline
        preload={uploadTab ? 'none' : 'metadata'}
        controls={!uploadTab}
        aria-hidden={uploadTab}
        tabIndex={uploadTab ? -1 : 0}
        aria-label="QUESTFEST audio"
      />
    </div>
  );
}
