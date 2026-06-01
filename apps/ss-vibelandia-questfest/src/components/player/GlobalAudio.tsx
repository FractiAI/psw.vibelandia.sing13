import { useCallback } from 'react';
import { bindSimpleAudioElement } from '@/lib/simplePlayback';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';
import { useCatalogStore } from '@/stores/catalogStore';

/** Single app-root audio element — never unmounts; muted on Upload tab only (iOS blue-screen fix). */
export function GlobalAudio() {
  const djMode = useCatalogStore((s) => s.djMode);

  const setRef = useCallback((el: HTMLAudioElement | null) => {
    bindSimpleAudioElement(el);
    registerPlaybackMedia(el, null);
  }, []);

  return (
    <div className={`sp-global-audio-wrap${djMode ? ' sp-global-audio-wrap--upload' : ''}`}>
      <audio
        ref={setRef}
        className="sp-global-audio"
        playsInline
        preload={djMode ? 'none' : 'metadata'}
        controls={!djMode}
        aria-hidden={djMode}
        tabIndex={djMode ? -1 : 0}
        aria-label="QUESTFEST audio"
      />
    </div>
  );
}
