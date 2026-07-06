import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { JukeboxPlaylistMenu } from '@/components/jukebox/JukeboxPlaylistMenu';
import { JukeboxTrackPanel } from '@/components/jukebox/JukeboxTrackPanel';
import { useCatalogStore } from '@/stores/catalogStore';
import { MASTER_PLAYLIST_ID, isMasterPlaylist } from '@/lib/catalogSeed';
import {
  SONIC_CATALOG_DISPLAY_NAME,
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
  const playlists = useCatalogStore((s) => s.playlists);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);

  const activePl = playlists.find((p) => p.id === activePlaylistId);
  const panelName =
    activePl && isMasterPlaylist(activePl.id)
      ? activePl.name?.trim() || SONIC_CATALOG_DISPLAY_NAME
      : (activePl?.name ?? 'Playlist');

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

  return (
    <div className="jb-app">
      <header className="jb-top">
        <nav className="jb-nav" aria-label="Site">
          <Link to="/bridge">Bridge</Link>
          <span aria-hidden="true">·</span>
          <span className="jb-nav__here">Listen</span>
          <span aria-hidden="true">·</span>
          <Link to="/dj">DJ</Link>
        </nav>
        <p className="jb-eyebrow">Sonic Singularity · Golden Era Jukebox</p>
        <h1 className="jb-h1">Listen</h1>
        <p className="jb-tagline">{SONIC_SINGULARITY_TAGLINE}</p>
      </header>

      <section className="jb-welcome" aria-label="Welcome">
        <p className="jb-welcome__title">{JUKEBOX_WELCOME_TITLE}</p>
        <p className="jb-welcome__body">{JUKEBOX_WELCOME}</p>
      </section>

      <div className="jb-machine">
        <div className="jb-machine__frame">
          <img
            className="jb-machine__photo"
            src={JUKEBOX_HERO_SRC}
            alt="1940s golden era jukebox"
            width={640}
            height={960}
            decoding="async"
          />
          <div className="jb-machine__glass">
            <div className="jb-machine__inner">
              <aside className="jb-machine__menu-col">
                <JukeboxPlaylistMenu
                  activeId={activePlaylistId || MASTER_PLAYLIST_ID}
                  onSelect={setActivePlaylist}
                />
              </aside>
              <div className="jb-machine__track-col">
                {trackCount === 0 ? (
                  <div className="jb-empty jb-empty--hero">
                    <p>No tracks yet.</p>
                    <Link to="/dj" className="jb-link-btn">
                      Upload on DJ tab
                    </Link>
                  </div>
                ) : (
                  <JukeboxTrackPanel
                    playlistId={activePlaylistId || MASTER_PLAYLIST_ID}
                    playlistName={panelName}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="jb-master-blurb">{SONIC_SINGULARITY_DESCRIPTION}</p>
      </div>
    </div>
  );
}
