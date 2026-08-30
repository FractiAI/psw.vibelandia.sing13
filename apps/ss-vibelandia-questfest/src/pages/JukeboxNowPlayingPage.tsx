import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { JukeboxSiteNav } from '@/components/jukebox/JukeboxSiteNav';
import { useJukeboxListenSetup } from '@/hooks/useJukeboxListenSetup';
import { useTrackPlayVisits } from '@/hooks/useTrackPlayVisits';
import { JUKEBOX_LISTEN_PATH } from '@/lib/jukeboxRoutes';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { useMediaChromeStore } from '@/stores/mediaChromeStore';
import { SONIC_BRAND_NAME } from '@/lib/sonicCatalogCopy';
import { fmtDuration } from '@/lib/formatDuration';
import { playingCoverUrl } from '@/lib/playingCover';
import { PLAIN } from '@/lib/plainSpeak';
import { EGS_EXPORT_USD } from '@/lib/paymentRails';
import { usePlaybackPlaylist } from '@/stores/catalogSelectors';
import { JukeboxPlaylistProgramBanner } from '@/components/jukebox/JukeboxPlaylistProgramBanner';

export function JukeboxNowPlayingPage() {
  useJukeboxListenSetup('qf-jukebox-now-page');

  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const displayTime = usePlaybackStore((s) => s.displayTime);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const openExport = useMediaChromeStore((s) => s.openExport);
  const plays = useTrackPlayVisits();
  const pl = usePlaybackPlaylist();
  const playbackPlaylistId = usePlaybackStore((s) => s.playbackPlaylistId);

  const track = currentTrackId ? getTrack(currentTrackId) : undefined;

  useEffect(() => {
    if (!currentTrackId) return;
    document.title = track ? `${track.title} · Now playing` : 'Now playing';
    return () => {
      document.title = SONIC_BRAND_NAME;
    };
  }, [currentTrackId, track]);

  if (!currentTrackId || !track) {
    return <Navigate to={JUKEBOX_LISTEN_PATH} replace />;
  }

  const cover = playingCoverUrl(track, pl);

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
          {typeof plays === 'number' ? (
            <p className="jb-now__visits" aria-label="Total plays">
              Visits · {plays.toLocaleString('en-US')}
            </p>
          ) : null}
          <button
            type="button"
            className="jb-now__download"
            onClick={() => openExport(track.id)}
          >
            {PLAIN.getPass}
          </button>
        </div>

        {playbackPlaylistId ? <JukeboxPlaylistProgramBanner playlistId={playbackPlaylistId} /> : null}

        <p className="jb-now__hint">
          Controls stay in the jukebox bar below. Download is ${EGS_EXPORT_USD.toFixed(2)} Fair Exchange on honor
          (Venmo · PayPal · Cash App).
        </p>
      </main>
    </div>
  );
}
