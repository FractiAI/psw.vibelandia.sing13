import { useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { TrackPlaylistsModal } from '@/components/catalog/TrackPlaylistsModal';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { fmtPlaylistTotalTime } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import { MASTER_LIBRARY_UI_HINT, SONIC_SINGULARITY_DESCRIPTION } from '@/lib/sonicCatalogCopy';

interface PlaylistEditorProps {
  playlistId: string;
  onDone: () => void;
  onPlay?: () => void;
  /** Called with the new playlist id after a successful duplicate (editor can switch to it). */
  onDuplicated?: (newPlaylistId: string) => void;
}

export function PlaylistEditor({ playlistId, onDone, onPlay, onDuplicated }: PlaylistEditorProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const updatePlaylist = useCatalogStore((s) => s.updatePlaylist);
  const deletePlaylist = useCatalogStore((s) => s.deletePlaylist);
  const addTrackToPlaylist = useCatalogStore((s) => s.addTrackToPlaylist);
  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);
  const reorderTrackInPlaylist = useCatalogStore((s) => s.reorderTrackInPlaylist);
  const duplicatePlaylist = useCatalogStore((s) => s.duplicatePlaylist);

  const pl = playlists.find((p) => p.id === playlistId);
  const masterPl = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [alsoAddTo, setAlsoAddTo] = useState<Set<string>>(new Set());
  const [trackPlModal, setTrackPlModal] = useState<{ id: string; title: string } | null>(null);

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
          (t.description?.toLowerCase().includes(q) ?? false) ||
          (t.genre?.toLowerCase().includes(q) ?? false)
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
    if (!window.confirm('Delete this playlist? Tracks stay in the Master catalog.')) return;
    deletePlaylist(playlistId);
    onDone();
  };

  const addTrackWithExtras = (trackId: string) => {
    addTrackToPlaylist(trackId, playlistId);
    for (const id of alsoAddTo) addTrackToPlaylist(trackId, id);
  };

  const handleDuplicate = () => {
    if (isMaster) return;
    saveMeta();
    const newId = duplicatePlaylist(playlistId);
    if (newId) onDuplicated?.(newId);
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
          {SONIC_SINGULARITY_DESCRIPTION}
          <span className="sp-pl-edit-banner-hint">{MASTER_LIBRARY_UI_HINT}</span>
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
          <h2 className="sp-pl-edit-tracks-title">
            {playlistTracks.length} {PLAIN.songs} · {fmtPlaylistTotalTime(pl.trackIds, getTrack)} {PLAIN.totalTime}
          </h2>
          {!isMaster && (
            <button
              type="button"
              className="sp-pl-edit-add-toggle"
              onClick={() => setShowAdd((v) => !v)}
              aria-expanded={showAdd}
            >
              {showAdd ? 'Hide add' : '+ Add from Master catalog'}
            </button>
          )}
        </div>

        {!isMaster && showAdd && (
          <div className="sp-pl-edit-add-panel">
            <input
              className="sp-search sp-pl-edit-add-search"
              type="search"
              placeholder="Search Master catalog"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
            />
            {masterTrackCount === 0 ? (
              <p className="sp-pl-edit-add-empty">Master catalog is empty — add tracks on the Upload tab first.</p>
            ) : availableTracks.length === 0 ? (
              <p className="sp-pl-edit-add-empty">Every song from the Master catalog is already in this playlist.</p>
            ) : (
              <>
                {otherPlaylists.length > 0 && (
                  <div className="sp-pl-edit-also-add">
                    <p className="sp-pl-edit-also-label">Also add new picks to:</p>
                    <ul className="sp-track-pl-list sp-track-pl-list--compact">
                      {otherPlaylists.map((op) => (
                        <li key={op.id}>
                          <label className="sp-track-pl-row">
                            <input
                              type="checkbox"
                              checked={alsoAddTo.has(op.id)}
                              onChange={() => {
                                setAlsoAddTo((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(op.id)) next.delete(op.id);
                                  else next.add(op.id);
                                  return next;
                                });
                              }}
                            />
                            <span className="sp-track-pl-meta">
                              <strong>{op.name}</strong>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <ul className="sp-pl-edit-add-list">
                  {availableTracks.map((tr) => (
                    <li key={tr.id} className="sp-pl-edit-add-row">
                      <span className="sp-pl-edit-track-info">
                        <strong>{tr.title}</strong>
                        <span>{tr.artist}</span>
                      </span>
                      <button type="button" className="sp-pl-edit-add-btn" onClick={() => addTrackWithExtras(tr.id)}>
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {playlistTracks.length === 0 ? (
          <p className="sp-pl-edit-empty">
            {isMaster ? (
              <>No uploads yet. Use the <strong>Upload</strong> tab.</>
            ) : (
              <>
                No songs yet. Tap <strong>+ Add from Master catalog</strong> above.
              </>
            )}
          </p>
        ) : (
          <>
            {!isMaster && <p className="sp-reorder-hint sp-pl-edit-hint">Hold ⋮⋮ and drag to reorder</p>}
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
                    className={`sp-pl-edit-row${isMaster ? ' sp-pl-edit-row--master' : ''}${dragging ? ' sp-pl-edit-row--dragging' : ''}${dropBefore ? ' sp-pl-edit-row--drop' : ''}`}
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
                    <div className="sp-pl-edit-row-actions">
                      <button
                        type="button"
                        className="sp-pl-edit-secondary"
                        onClick={() => setTrackPlModal({ id: tr.id, title: tr.title })}
                      >
                        Playlists
                      </button>
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
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      <TrackPlaylistsModal
        open={!!trackPlModal}
        trackId={trackPlModal?.id ?? ''}
        trackTitle={trackPlModal?.title ?? ''}
        onClose={() => setTrackPlModal(null)}
      />

      {!isMaster && (
        <footer className="sp-pl-edit-foot">
          <button type="button" className="sp-library-btn" onClick={handleDuplicate}>
            Duplicate playlist
          </button>
          {playlists.length > 1 && (
            <button type="button" className="sp-library-delete" onClick={handleDelete}>
              Delete playlist
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
