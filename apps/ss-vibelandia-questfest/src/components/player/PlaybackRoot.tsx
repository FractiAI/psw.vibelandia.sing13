import { useEffect } from 'react';
import { GlobalAudio } from '@/components/player/GlobalAudio';
import { PlayerDock } from '@/components/player/PlayerDock';
import { pauseSimpleAudio } from '@/lib/simplePlayback';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';

/** App-level playback — one <audio> always mounted; chrome hidden on Upload / Playlists tabs. */
export function PlaybackRoot() {
  const djMode = useCatalogStore((s) => s.djMode);
  const playlistTab = useCatalogStore((s) => s.playlistTab);
  const chromeSafe = djMode || playlistTab;

  useEffect(() => {
    document.documentElement.classList.toggle('qf-upload-tab', djMode);
    document.documentElement.classList.toggle('qf-playlists-tab', playlistTab);
    document.documentElement.classList.toggle('qf-playback-dock', !chromeSafe);
    if (chromeSafe) {
      pauseSimpleAudio();
      const pb = usePlaybackStore.getState();
      pb.setPlaying(false);
      pb.setTrack(null);
      pb.setPlaybackError(null);
    }
    return () => {
      document.documentElement.classList.remove('qf-upload-tab');
      document.documentElement.classList.remove('qf-playlists-tab');
      document.documentElement.classList.remove('qf-playback-dock');
    };
  }, [djMode, playlistTab, chromeSafe]);

  return (
    <div className="sp-playback-stack" aria-hidden={chromeSafe} data-playback-dock={chromeSafe ? undefined : 'on'}>
      <GlobalAudio />
      {!chromeSafe ? <PlayerDock /> : null}
    </div>
  );
}
