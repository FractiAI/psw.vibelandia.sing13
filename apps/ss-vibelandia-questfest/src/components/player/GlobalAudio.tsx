import { useCallback } from 'react';
import { bindSimpleAudioElement } from '@/lib/simplePlayback';
import { registerPlaybackMedia } from '@/lib/playbackMediaRegistry';
import { useCatalogStore } from '@/stores/catalogStore';

/** Single app-root audio element — never unmounts; muted on Upload / Playlists tabs (iOS blue-screen fix). */
export function GlobalAudio() {
  const djMode = useCatalogStore((s) => s.djMode);
  const playlistTab = useCatalogStore((s) => s.playlistTab);
  const chromeSafe = djMode || playlistTab;

  const setRef = useCallback((el: HTMLAudioElement | null) => {
    bindSimpleAudioElement(el);
    registerPlaybackMedia(el, null);
  }, []);

  return (
    <div className={`sp-global-audio-wrap${chromeSafe ? ' sp-global-audio-wrap--upload' : ''}`}>
      <audio
        ref={setRef}
        className="sp-global-audio"
        playsInline
        preload={chromeSafe ? 'none' : 'metadata'}
        controls={!chromeSafe}
        aria-hidden={chromeSafe}
        tabIndex={chromeSafe ? -1 : 0}
        aria-label="QUESTFEST audio"
      />
    </div>
  );
}
