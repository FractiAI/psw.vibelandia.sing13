import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PlaylistEditor } from '@/components/catalog/PlaylistEditor';
import { JukeboxPlaylistMenu } from '@/components/jukebox/JukeboxPlaylistMenu';
import { PlaylistManageModal } from '@/components/jukebox/PlaylistManageModal';
import { JukeboxTrackPanel } from '@/components/jukebox/JukeboxTrackPanel';
import { JukeboxSiteNav } from '@/components/jukebox/JukeboxSiteNav';
import { useJukeboxListenSetup } from '@/hooks/useJukeboxListenSetup';
import { useCatalogStore } from '@/stores/catalogStore';
import { MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { JUKEBOX_NOW_PLAYING_PATH } from '@/lib/jukeboxRoutes';
import { setSharedTrackAutoplaySeed } from '@/lib/sharedTrackPlayback';
import { playTrackById } from '@/lib/trackPlayback';
import { PLAIN } from '@/lib/plainSpeak';

export const JUKEBOX_HERO_SRC = '/interfaces/assets/jukebox-golden-era-1940s.png';

export function JukeboxListenPage() {
  useJukeboxListenSetup();

  const navigate = useNavigate();
  const activePlaylistId = useCatalogStore((s) => s.activePlaylistId);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const deviceHydrated = useCatalogStore((s) => s.deviceHydrated);
  const playlists = useCatalogStore((s) => s.playlists);
  const trackCount = useCatalogStore((s) => Object.keys(s.tracks).length);
  const catalogSyncing = useCatalogStore((s) => s.catalogSyncing);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const [searchParams, setSearchParams] = useSearchParams();
  const sharedTrackHandled = useRef(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [managePlaylistsOpen, setManagePlaylistsOpen] = useState(false);

  const openNowPlaying = () => navigate(JUKEBOX_NOW_PLAYING_PATH);

  const handleSelectPlaylist = (id: string) => {
    setEditingPlaylistId(null);
    setActivePlaylist(id);
  };

  const handleCreatePlaylist = () => {
    const id = createPlaylist(PLAIN.newPlaylist);
    setActivePlaylist(id);
    setEditingPlaylistId(id);
  };

  const finishEditing = () => {
    setEditingPlaylistId(null);
  };

  useEffect(() => {
    if (!activePlaylistId) setActivePlaylist(MASTER_PLAYLIST_ID);
  }, [activePlaylistId, setActivePlaylist]);

  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId || !deviceHydrated) return;
    if (!playlists.some((p) => p.id === editId)) {
      setSearchParams({}, { replace: true });
      return;
    }
    setActivePlaylist(editId);
    setEditingPlaylistId(editId);
    setSearchParams({}, { replace: true });
  }, [deviceHydrated, playlists, searchParams, setActivePlaylist, setSearchParams]);

  useEffect(() => {
    if (editingPlaylistId && !playlists.some((p) => p.id === editingPlaylistId)) {
      setEditingPlaylistId(null);
    }
  }, [editingPlaylistId, playlists]);

  useEffect(() => {
    const trackId = searchParams.get('track');
    if (!trackId || !deviceHydrated || sharedTrackHandled.current) return;
    const tr = getTrack(trackId);
    if (!tr) return;
    sharedTrackHandled.current = true;
    setActivePlaylist(MASTER_PLAYLIST_ID);
    setSharedTrackAutoplaySeed(trackId);
    playTrackById(trackId, getTrack, { playbackPlaylistId: MASTER_PLAYLIST_ID });
    setSearchParams({}, { replace: true });
    navigate(JUKEBOX_NOW_PLAYING_PATH, { replace: true });
  }, [deviceHydrated, getTrack, navigate, searchParams, setActivePlaylist, setSearchParams, trackCount]);

  const playlistId = activePlaylistId || MASTER_PLAYLIST_ID;

  return (
    <div className="jb-app jb-app--browse">
      <JukeboxSiteNav mode="browse" />

      <div className="jb-stage" aria-label="Jukebox selector">
        <JukeboxPlaylistMenu
          activeId={playlistId}
          onSelect={handleSelectPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          onManagePlaylists={() => setManagePlaylistsOpen(true)}
        />
        <PlaylistManageModal
          open={managePlaylistsOpen}
          onClose={() => setManagePlaylistsOpen(false)}
          onEditPlaylist={(id) => {
            setManagePlaylistsOpen(false);
            setActivePlaylist(id);
            setEditingPlaylistId(id);
          }}
        />
        <div className="jb-stage__tracks" aria-label="Selected playlist tracks">
          {trackCount === 0 && !editingPlaylistId ? (
            <div className="jb-empty jb-empty--stage">
              {!deviceHydrated || catalogSyncing ? (
                <p>Loading Sonic Ship catalog…</p>
              ) : (
                <>
                  <p>No tracks on the Sonic Ship yet.</p>
                  <Link to="/dj" className="jb-link-btn">
                    Upload on DJ tab — feed the hydrogen Y line
                  </Link>
                </>
              )}
            </div>
          ) : editingPlaylistId && playlists.some((p) => p.id === editingPlaylistId) ? (
            <PlaylistEditor
              key={editingPlaylistId}
              playlistId={editingPlaylistId}
              onDone={finishEditing}
              onPlay={() => {
                finishEditing();
                openNowPlaying();
              }}
              onDuplicated={(newId) => setEditingPlaylistId(newId)}
            />
          ) : (
            <JukeboxTrackPanel
              playlistId={playlistId}
              onOpenNowPlaying={openNowPlaying}
              onEditPlaylist={() => setEditingPlaylistId(playlistId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
