import { useCatalogStore } from '@/stores/catalogStore';

interface AddToPlaylistModalProps {
  open: boolean;
  playlistId: string;
  onClose: () => void;
}

export function AddToPlaylistModal({ open, playlistId, onClose }: AddToPlaylistModalProps) {
  const listAllTracks = useCatalogStore((s) => s.listAllTracks);
  const playlists = useCatalogStore((s) => s.playlists);
  const addTrackToPlaylist = useCatalogStore((s) => s.addTrackToPlaylist);

  if (!open) return null;

  const pl = playlists.find((p) => p.id === playlistId);
  const inPlaylist = new Set(pl?.trackIds ?? []);
  const tracks = listAllTracks().filter((t) => !inPlaylist.has(t.id));

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--wide sp-add-modal">
        <h2 className="modal-title">Add to {pl?.name ?? 'playlist'}</h2>
        <p className="modal-body">Pick tracks from your catalog.</p>
        {tracks.length === 0 ? (
          <p className="sp-empty">All catalog tracks are already in this playlist. Upload more on Upload.</p>
        ) : (
          <ul className="sp-add-list">
            {tracks.map((tr) => (
              <li key={tr.id} className="sp-add-row">
                <span className="sp-add-meta">
                  <strong>{tr.title}</strong>
                  <span>{tr.artist}</span>
                </span>
                <button
                  type="button"
                  className="sp-add-btn"
                  onClick={() => addTrackToPlaylist(tr.id, playlistId)}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
