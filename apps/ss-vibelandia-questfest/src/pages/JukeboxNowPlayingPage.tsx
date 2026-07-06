import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { JukeboxSiteNav } from '@/components/jukebox/JukeboxSiteNav';
import { useJukeboxListenSetup } from '@/hooks/useJukeboxListenSetup';
import { JUKEBOX_LISTEN_PATH } from '@/lib/jukeboxRoutes';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { fmtDuration } from '@/lib/formatDuration';
import type { TrackDef } from '@/lib/catalogTypes';

function trackCoverUrl(track: TrackDef): string | undefined {
  if (!track.posterSrc) return undefined;
  const sep = track.posterSrc.includes('?') ? '&' : '?';
  return `${track.posterSrc}${sep}v=${encodeURIComponent(track.id)}`;
}

export function JukeboxNowPlayingPage() {
  useJukeboxListenSetup('qf-jukebox-now-page');

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const getTrack = useCatalogStore((s) => s.getTrack);

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;

  useEffect(() => {
    if (!currentTrackId) return;
    document.title = track ? `${track.title} · Now playing` : 'Now playing';
    return () => {
      document.title = 'SS VIBELANDIA QUESTFEST';
    };
  }, [currentTrackId, track]);

  if (!currentTrackId || !track) {
    return <Navigate to={JUKEBOX_LISTEN_PATH} replace />;
  }

  const cover = trackCoverUrl(track);

  return (
    <div className="jb-app jb-app--now">
      <JukeboxSiteNav mode="now" />

      <main className="jb-now" aria-label="Now playing">
        <Link to={JUKEBOX_LISTEN_PATH} className="jb-now__back">
          ← Browse catalog
        </Link>

        <div className="jb-now__art-wrap">
          {cover ? (
            <img className="jb-now__art" src={cover} alt="" width={320} height={320} decoding="async" />
          ) : (
            <div className="jb-now__art jb-now__art--empty" aria-hidden>
              ♪
            </div>
          )}
        </div>

        <div className="jb-now__meta">
          <p className="jb-now__status">{isPlaying ? 'Playing' : 'Paused'}</p>
          <h1 className="jb-now__title">{track.title}</h1>
          <p className="jb-now__artist">{track.artist}</p>
          {track.genre ? <p className="jb-now__genre">{track.genre}</p> : null}
          {track.durationSec ? (
            <p className="jb-now__time">
              {fmtDuration(displayTime)} / {fmtDuration(track.durationSec)}
            </p>
          ) : null}
          {track.description ? <p className="jb-now__desc">{track.description}</p> : null}
          {track.story ? <p className="jb-now__story">{track.story}</p> : null}
        </div>

        <p className="jb-now__hint">Controls stay in the player bar below. Leave this page anytime — playback continues.</p>
      </main>
    </div>
  );
}
