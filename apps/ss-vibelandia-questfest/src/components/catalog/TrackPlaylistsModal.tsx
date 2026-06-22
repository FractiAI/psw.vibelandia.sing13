import { useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { isMasterPlaylist } from '@/lib/catalogSeed';

interface TrackPlaylistsModalProps {
  open: boolean;
  trackId: string;
  trackTitle: string;
  onClose: () => void;
}

export function TrackPlaylistsModal({ open, trackId, trackTitle, onClose }: TrackPlaylistsModalProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const setTrackPlaylistMembership = useCatalogStore((s) => s.setTrackPlaylistMembership);

  const userPlaylists = useMemo(
    () => playlists.filter((p) => !isMasterPlaylist(p.id)).sort((a, b) => a.name.localeCompare(b.name)),
    [playlists],
  );

  const initialSelected = useMemo(
    () => new Set(userPlaylists.filter((p) => p.trackIds.includes(trackId)).map((p) => p.id)),
    [trackId, userPlaylists],
  );

  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelected));

  useEffect(() => {
    if (open) setSelected(new Set(initialSelected));
  }, [open, initialSelected]);

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = () => {
    setTrackPlaylistMembership(trackId, [...selected]);
    onClose();
  };

  const handleNewPlaylist = () => {
    const id = createPlaylist('New playlist');
    setSelected((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const canSave =
    [...selected].sort().join(',') !== [...initialSelected].sort().join(',');

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="tpl-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="voxel-panel modal-card modal-card--wide sp-track-pl-modal">
        <h2 id="tpl-title" className="modal-title">
          Playlists for <em>{trackTitle}</em>
        </h2>
        <p className="modal-body">
          Check every playlist that should include this song. Changes apply when you tap Save. The Master catalog
          always keeps every upload.
        </p>
        <div className="sp-track-pl-toolbar">
          <button type="button" className="sp-library-new" onClick={handleNewPlaylist}>
            + New playlist
          </button>
        </div>
        {userPlaylists.length === 0 ? (
          <p className="sp-empty">
            No playlists yet — tap <strong>+ New playlist</strong>, then check the list and Save.
          </p>
        ) : (
          <ul className="sp-track-pl-list">
            {userPlaylists.map((pl) => (
              <li key={pl.id}>
                <label className="sp-track-pl-row">
                  <input type="checkbox" checked={selected.has(pl.id)} onChange={() => toggle(pl.id)} />
                  <span className="sp-track-pl-meta">
                    <strong>{pl.name}</strong>
                    <span>
                      {selected.has(pl.id)
                        ? pl.trackIds.includes(trackId)
                          ? 'Currently in list'
                          : 'Will add on Save'
                        : pl.trackIds.includes(trackId)
                          ? 'Will remove on Save'
                          : 'Not in list'}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="voxel-btn voxel-btn--orange"
            onClick={save}
            disabled={!canSave}
          >
            Save playlists
          </button>
          <button type="button" className="voxel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
