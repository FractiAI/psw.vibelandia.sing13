import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { bindSimpleAudioElement } from '@/lib/simplePlayback';
import { getPlaybackMedia, registerPlaybackMedia } from '@/lib/playbackMediaRegistry';
import { useCatalogStore } from '@/stores/catalogStore';

/** Single app-root audio element — never unmounts; muted on Upload tab only (iOS blue-screen fix). */
export function GlobalAudio() {
  const djMode = useCatalogStore((s) => s.djMode);
  const { pathname } = useLocation();
  /** Listen / Bridge use custom chrome only — native controls steal space on iPhone. */
  const chromeOnly =
    !djMode && (pathname === '/listen' || pathname === '/listen/now' || pathname === '/bridge');

  const setRef = useCallback((el: HTMLAudioElement | null) => {
    bindSimpleAudioElement(el);
    registerPlaybackMedia(el, getPlaybackMedia().background);
  }, []);

  return (
    <div
      className={`sp-global-audio-wrap${djMode ? ' sp-global-audio-wrap--upload' : ''}${chromeOnly ? ' sp-global-audio-wrap--chrome-only' : ''}`}
    >
      <audio
        ref={setRef}
        className={`sp-global-audio${chromeOnly ? ' sp-global-audio--chrome-only' : ''}`}
        playsInline
        preload={djMode ? 'none' : 'metadata'}
        controls={!djMode && !chromeOnly}
        aria-hidden={djMode || chromeOnly}
        tabIndex={djMode || chromeOnly ? -1 : 0}
        aria-label="QUESTFEST audio"
      />
    </div>
  );
}
