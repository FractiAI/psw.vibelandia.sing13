import { useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';

interface PlaylistEditorProps {
  playlistId: string;
  onDone: () => void;
  onPlay?: () => void;
}

export function PlaylistEditor({ playlistId, onDone, onPlay }: PlaylistEditorProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const updatePlaylist = useCatalogStore((s) => s.updatePlaylist);
  const deletePlaylist = useCatalogStore((s) => s.deletePlaylist);
  const addTrackToPlaylist = useCatalogStore((s) => s.addTrackToPlaylist);
  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);
  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);
  const moveTrackInPlaylist = useCatalogStore((s) => s.moveTrackInPlaylist);

  const pl = playlists.find((p) => p.id === playlistId);
  const masterPl = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState('');

  const isMaster = isMasterPlaylist(playlistId);

  useEffect(() => {
    if (!pl) return;
    setName(pl.name);
    setDescription(pl.description);
    setShowAdd(false);
    setAddSearch('');
  }, [playlistId, pl?.id, pl?.name, pl?.description]);

  const canReorder = (pl?.trackIds.length ?? 0) > 1;
  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =
    usePlaylistReorder(playlistId, canReorder, reorderTrackInPlaylist);

  const inPlaylist = useMemo(() => new Set(pl?.trackIds ?? []), [pl?.trackIds]);

  const playlistTracks = useMemo(() => {
    if (!pl) return [];
    return pl.trackIds
      .map((id, index) => ({ id, index, track: getTrack(id) }))
      .filter((row): row is { id: string; index: number; track: NonNullable<ReturnType<typeof getTrack>> } => !!row.track);
  }, [pl, getTrack]);

  const availableTracks = useMemo(() => {
    if (isMaster) return [];
    const q = addSearch.trim().toLowerCase();
    const masterIds = masterPl?.trackIds ?? [];
    return masterIds
      .map((id) => getTrack(id))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .filter((t) => !inPlaylist.has(t.id))
      .filter((t) => {
        if (!q) return true;
        return (
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [isMaster, masterPl?.trackIds, getTrack, inPlaylist, addSearch]);

  if (!pl) {
    return (
      <section className="sp-pl-edit">
        <p className="sp-empty">Playlist not found.</p>
        <button type="button" className="sp-hero-secondary" onClick={onDone}>
          Back
        </button>
      </section>
    );
  }

  const masterTrackCount = masterPl?.trackIds.length ?? 0;

  const saveMeta = () => {
    updatePlaylist(playlistId, { name, description });
  };

  const handleDone = () => {
    saveMeta();
    onDone();
  };

  const handleDelete = () => {
    if (isMaster) return;
    if (playlists.length <= 1) return;
    if (!window.confirm('Delete this playlist? Tracks stay in All uploads.')) return;
    deletePlaylist(playlistId);
    onDone();
  };

  return (
    <section className="sp-pl-edit">
      <header className="sp-pl-edit-head">
        <button type="button" className="sp-pl-edit-back" onClick={handleDone}>
          Done
        </button>
        {onPlay && (
          <button type="button" className="sp-pl-edit-play" onClick={onPlay}>
            Play
          </button>
        )}
      </header>

      {isMaster && (
        <p className="sp-pl-edit-banner">
          <strong>All uploads</strong> — every new upload is added here automatically. Build other playlists from this
          list with <strong>+ Add songs</strong> on those playlists.
        </p>
      )}

      <div className="sp-pl-edit-meta">
        <label className="sp-library-field">
          Playlist name
          <input
            className="sp-library-input sp-pl-edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={saveMeta}
            placeholder="Playlist name"
          />
        </label>
        <label className="sp-library-field">
          Description
          <textarea
            className="sp-library-input sp-library-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={saveMeta}
            rows={2}
            placeholder="Optional description"
          />
        </label>
      </div>

      <div className="sp-pl-edit-tracks">
        <div className="sp-pl-edit-tracks-bar">
          <h2 className="sp-pl-edit-tracks-title">{playlistTracks.length} songs</h2>
          {!isMaster && (
            <button
              type="button"
              className="sp-pl-edit-add-toggle"
              onClick={() => setShowAdd((v) => !v)}
              aria-expanded={showAdd}
            >
              {showAdd ? 'Hide add' : '+ Add from All uploads'}
            </button>
          )}
        </div>

        {!isMaster && showAdd && (
          <div className="sp-pl-edit-add-panel">
            <input
              className="sp-search sp-pl-edit-add-search"
              type="search"
              placeholder="Search All uploads"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
            />
            {masterTrackCount === 0 ? (
              <p className="sp-pl-edit-add-empty">All uploads is empty — add tracks on the Upload tab first.</p>
            ) : availableTracks.length === 0 ? (
              <p className="sp-pl-edit-add-empty">Every song from All uploads is already in this playlist.</p>
            ) : (
              <ul className="sp-pl-edit-add-list">
                {availableTracks.map((tr) => (
                  <li key={tr.id} className="sp-pl-edit-add-row">
                    <span className="sp-pl-edit-track-info">
                      <strong>{tr.title}</strong>
                      <span>{tr.artist}</span>
                    </span>
                    <button
                      type="button"
                      className="sp-pl-edit-add-btn"
                      onClick={() => addTrackToPlaylist(tr.id, playlistId)}
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {playlistTracks.length === 0 ? (
          <p className="sp-pl-edit-empty">
            {isMaster ? (
              <>No uploads yet. Use the <strong>Upload</strong> tab.</>
            ) : (
              <>
                No songs yet. Tap <strong>+ Add from All uploads</strong> above.
              </>
            )}
          </p>
        ) : (
          <>
            {!isMaster && (
              <p className="sp-reorder-hint sp-pl-edit-hint">Hold ⋮⋮ and drag, or use ↑ ↓ to move</p>
            )}
            {isMaster && (
              <p className="sp-reorder-hint sp-pl-edit-hint">Order updates when you upload. Drag to sort your library.</p>
            )}
            <ol className="sp-pl-edit-list" ref={listRef}>
              {playlistTracks.map((row, displayIndex) => {
                const tr = row.track;
                const dragging = dragIndex === row.index;
                const dropBefore =
                  overIndex === row.index && dragIndex !== null && dragIndex !== row.index;
                return (
                  <li
                    key={tr.id}
                    data-reorder-idx={row.index}
                    className={`sp-pl-edit-row${dragging ? ' sp-pl-edit-row--dragging' : ''}${dropBefore ? ' sp-pl-edit-row--drop' : ''}`}
                  >
                    <button
                      type="button"
                      className="sp-row-grip"
                      aria-label={`Move ${tr.title}`}
                      onPointerDown={(e) => onGripPointerDown(row.index, e)}
                      onPointerMove={onGripPointerMove}
                      onPointerUp={(e) => onGripPointerUp(row.index, e)}
                      onPointerCancel={(e) => onGripPointerUp(row.index, e)}
                      disabled={!canReorder}
                    >
                      ⋮⋮
                    </button>
                    <span className="sp-pl-edit-idx">{displayIndex + 1}</span>
                    <span className="sp-pl-edit-track-info">
                      <strong>{tr.title}</strong>
                      <span>{tr.artist}</span>
                    </span>
                    <div className="sp-pl-edit-moves">
                      <button
                        type="button"
                        className="sp-pl-edit-nudge"
                        disabled={row.index === 0}
                        onClick={() => moveTrackInPlaylist(playlistId, tr.id, -1)}
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="sp-pl-edit-nudge"
                        disabled={row.index === pl.trackIds.length - 1}
                        onClick={() => moveTrackInPlaylist(playlistId, tr.id, 1)}
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    {!isMaster && (
                      <button
                        type="button"
                        className="sp-pl-edit-remove"
                        onClick={() => removeTrackFromPlaylist(tr.id, playlistId)}
                        aria-label={`Remove ${tr.title}`}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      {!isMaster && playlists.length > 1 && (
        <footer className="sp-pl-edit-foot">
          <button type="button" className="sp-library-delete" onClick={handleDelete}>
            Delete playlist
          </button>
        </footer>
      )}
    </section>
  );
}
