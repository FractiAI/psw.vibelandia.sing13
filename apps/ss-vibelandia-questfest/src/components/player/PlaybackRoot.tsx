import { useEffect } from 'react';
import { GlobalAudio } from '@/components/player/GlobalAudio';
import { PlayerDock } from '@/components/player/PlayerDock';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { useCatalogStore } from '@/stores/catalogStore';

/** App-level playback — one <audio> always mounted; chrome hidden on Upload tab. */
export function PlaybackRoot() {
  const djMode = useCatalogStore((s) => s.djMode);

  useEffect(() => {
    document.documentElement.classList.toggle('qf-upload-tab', djMode);
    if (djMode) pauseSimpleAudio();
    return () => document.documentElement.classList.remove('qf-upload-tab');
  }, [djMode]);

  return (
    <div className="sp-playback-stack" aria-hidden={djMode}>
      <GlobalAudio />
      {!djMode ? <PlayerDock /> : null}
    </div>
  );
}
