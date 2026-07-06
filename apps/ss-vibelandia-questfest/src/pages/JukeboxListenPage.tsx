import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { JukeboxPlaylistMenu } from '@/components/jukebox/JukeboxPlaylistMenu';
import { JukeboxTrackPanel } from '@/components/jukebox/JukeboxTrackPanel';
import { useCatalogStore } from '@/stores/catalogStore';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { playTrackById } from '@/lib/trackPlayback';
import {
  SONIC_SINGULARITY_DESCRIPTION,
  SONIC_SINGULARITY_TAGLINE,
  JUKEBOX_WELCOME,
  JUKEBOX_WELCOME_TITLE,
} from '@/lib/sonicCatalogCopy';

export const JUKEBOX_HERO_SRC = '/interfaces/assets/jukebox-golden-era-1940s.png';

export function JukeboxListenPage() {
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const setDjMode = useCatalogStore((s) => s.setDjMode);
  const setPlaylistTab = useCatalogStore((s) => s.setPlaylistTab);
  const syncLibraryFromServer = useCatalogStore((s) => s.syncLibraryFromServer);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const [searchParams] = useSearchParams();
  const sharedTrackHandled = useRef(false);

  useEffect(() => {
    document.documentElement.classList.add('qf-jukebox-page');
    setDjMode(false);
    setPlaylistTab(false);
    const hydrate = () => useCatalogStore.getState().hydrateFromDevice();
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(hydrate, { timeout: 120 });
    } else {
      setTimeout(hydrate, 0);
    }
    return () => document.documentElement.classList.remove('qf-jukebox-page');
  }, [setDjMode, setPlaylistTab]);

  useEffect(() => {
    if (!deviceHydrated) return;
    void syncLibraryFromServer();
  }, [deviceHydrated, syncLibraryFromServer]);

  useEffect(() => {
    if (!activePlaylistId) setActivePlaylist(MASTER_PLAYLIST_ID);
  }, [activePlaylistId, setActivePlaylist]);

  useEffect(() => {
    const trackId = searchParams.get('track');
    if (!trackId || !deviceHydrated || sharedTrackHandled.current) return;
    const tr = getTrack(trackId);
    if (!tr) return;
    sharedTrackHandled.current = true;
    playTrackById(trackId, getTrack);
  }, [deviceHydrated, getTrack, searchParams, trackCount]);

  const playlistId = activePlaylistId || MASTER_PLAYLIST_ID;

  return (
    <div className="jb-app">
      <header className="jb-top jb-top--slim">
        <nav className="jb-nav" aria-label="Site">
          <Link to="/bridge">Bridge</Link>
          <span aria-hidden="true">·</span>
          <span className="jb-nav__here">Listen</span>
          <span aria-hidden="true">·</span>
          <Link to="/dj">DJ</Link>
        </nav>
        <p className="jb-eyebrow">Sonic Singularity · Golden Era Jukebox</p>
        <p className="jb-tagline jb-tagline--slim">{SONIC_SINGULARITY_TAGLINE}</p>
      </header>

      <div className="jb-stage" aria-label="Jukebox selector">
        <div className="jb-stage__hero">
          <img
            className="jb-stage__photo"
            src={JUKEBOX_HERO_SRC}
            alt="1940s golden era jukebox"
            width={640}
            height={960}
            decoding="async"
          />
        </div>
        <JukeboxPlaylistMenu activeId={playlistId} onSelect={setActivePlaylist} />
      </div>

      <main className="jb-body">
        <section className="jb-welcome jb-welcome--compact" aria-label="Welcome">
          <p className="jb-welcome__title">{JUKEBOX_WELCOME_TITLE}</p>
          <p className="jb-welcome__body">{JUKEBOX_WELCOME}</p>
        </section>

        {trackCount === 0 ? (
          <div className="jb-empty jb-empty--hero">
            <p>No tracks yet.</p>
            <Link to="/dj" className="jb-link-btn">
              Upload on DJ tab
            </Link>
          </div>
        ) : (
          <JukeboxTrackPanel playlistId={playlistId} />
        )}

        <p className="jb-master-blurb">{SONIC_SINGULARITY_DESCRIPTION}</p>
      </main>
    </div>
  );
}
