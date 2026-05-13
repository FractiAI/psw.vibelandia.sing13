import { usePlaylistStore } from '@/stores/playlistStore';
import { usePlaybackStore } from '@/stores/playbackStore';

export function PlaylistDock() {
  const playlists = usePlaylistStore((s) => s.playlists);
  const activeId = usePlaylistStore((s) => s.activePlaylistId);
  const setActive = usePlaylistStore((s) => s.setActivePlaylist);
  const moveTrack = usePlaylistStore((s) => s.moveTrackToPlaylist);
  const getTrack = usePlaylistStore((s) => s.getTrack);
  const setTrack = usePlaybackStore((s) => s.setTrack);
  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);

  return (
    <div className="voxel-panel dock">
      <h3 className="dock-title">Master Playlists</h3>
      <p className="dock-sub">Tracks inherit permissions from the playlist container.</p>
      <div className="dock-grid">
        {playlists.map((pl) => (
          <button
            key={pl.id}
            type="button"
            className={`dock-card ${pl.id === activeId ? 'dock-card--on' : ''}`}
            onClick={() => setActive(pl.id)}
          >
            <div className="dock-card-k">{pl.kind === 'sovereign' ? 'SOVEREIGN' : 'OPEN'}</div>
            <div className="dock-card-name">{pl.name}</div>
            <p className="dock-card-desc">{pl.description}</p>
            <ul className="dock-tracks">
              {pl.trackIds.map((tid) => {
                const tr = getTrack(tid);
                if (!tr) return null;
                return (
                  <li key={tid}>
                    <button
                      type="button"
                      className={tid === currentTrackId ? 'dock-track dock-track--on' : 'dock-track'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActive(pl.id);
                        setTrack(tid);
                      }}
                    >
                      {tr.title}
                    </button>
                    <div className="dock-move">
                      {playlists
                        .filter((p) => p.id !== pl.id)
                        .map((target) => (
                          <button
                            key={target.id}
                            type="button"
                            className="dock-move-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTrack(tid, target.id);
                            }}
                          >
                            → {target.name.replace(/Master Playlist|Broadcast/, '…')}
                          </button>
                        ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </button>
        ))}
      </div>
    </div>
  );
}
