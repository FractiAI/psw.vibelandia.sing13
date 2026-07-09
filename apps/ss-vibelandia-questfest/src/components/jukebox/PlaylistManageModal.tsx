import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import {
  isMasterPlaylist,
  isMyLikesPlaylist,
  MASTER_PLAYLIST_ID,
  MY_LIKES_PLAYLIST_ID,
} from '@/lib/catalogSeed';
import { applyPlaylistMenuOrder, manageableMenuPlaylists } from '@/lib/playlistMenuOrder';
import { resolvePlaylistTrackIds } from '@/lib/playlistNest';
import { PLAIN } from '@/lib/plainSpeak';
import { SONIC_CATALOG_DISPLAY_NAME } from '@/lib/sonicCatalogCopy';

interface PlaylistManageModalProps {
  open: boolean;
  onClose: () => void;
  onEditPlaylist: (playlistId: string) => void;
}

export function PlaylistManageModal({ open, onClose, onEditPlaylist }: PlaylistManageModalProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const tracks = useCatalogStore((s) => s.tracks);
  const menuOrder = useCatalogStore((s) => s.userPlaylistMenuOrder);
  const renamePlaylist = useCatalogStore((s) => s.renamePlaylist);
  const duplicatePlaylist = useCatalogStore((s) => s.duplicatePlaylist);
  const deletePlaylist = useCatalogStore((s) => s.deletePlaylist);
  const reorderUserPlaylistMenu = useCatalogStore((s) => s.reorderUserPlaylistMenu);
  const moveUserPlaylistMenu = useCatalogStore((s) => s.moveUserPlaylistMenu);

  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const renameDraftRef = useRef('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const pinned = useMemo(() => {
    const master = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);
    const likes = playlists.find((p) => p.id === MY_LIKES_PLAYLIST_ID);
    return [master, likes].filter((p): p is NonNullable<typeof p> => !!p);
  }, [playlists]);

  const userPlaylists = useMemo(() => {
    const ordered = applyPlaylistMenuOrder(playlists, menuOrder);
    return manageableMenuPlaylists(ordered);
  }, [menuOrder, playlists]);

  const canReorder = userPlaylists.length > 1;

  const handleReorder = useCallback(
    (_playlistId: string, fromIndex: number, toIndex: number) => {
      reorderUserPlaylistMenu(fromIndex, toIndex);
    },
    [reorderUserPlaylistMenu],
  );

  const { listRef, dragIndex, overIndex, onGripPointerDown, onGripPointerMove, onGripPointerUp } =
    usePlaylistReorder('menu', canReorder, handleReorder);

  useEffect(() => {
    renameDraftRef.current = renameDraft;
  }, [renameDraft]);

  useEffect(() => {
    if (!open) {
      setRenameId(null);
      setRenameDraft('');
      renameDraftRef.current = '';
    }
  }, [open]);

  useEffect(() => {
    if (!renameId || !open) return;
    const t = window.setTimeout(() => {
      const el = renameInputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    }, 80);
    return () => window.clearTimeout(t);
  }, [open, renameId]);

  const finishRename = useCallback(() => {
    if (!renameId) return;
    const name = renameDraftRef.current.trim() || 'New playlist';
    renamePlaylist(renameId, name);
    setRenameId(null);
    setRenameDraft('');
    renameDraftRef.current = '';
  }, [renameId, renamePlaylist]);

  const cancelRename = useCallback(() => {
    setRenameId(null);
    setRenameDraft('');
    renameDraftRef.current = '';
  }, []);

  const startRename = useCallback((id: string, currentName: string) => {
    setRenameId(id);
    setRenameDraft(currentName);
    renameDraftRef.current = currentName;
  }, []);

  const handleDuplicate = useCallback(
    (id: string) => {
      const newId = duplicatePlaylist(id);
      if (newId) onEditPlaylist(newId);
    },
    [duplicatePlaylist, onEditPlaylist],
  );

  const handleDelete = useCallback(
    (id: string, name: string) => {
      if (!window.confirm(`Delete "${name}"? Tracks stay in the Master catalog.`)) return;
      deletePlaylist(id);
    },
    [deletePlaylist],
  );

  if (!open) return null;

  return (
    <div className="jb-pl-picker-backdrop jb-pl-picker-backdrop--manage" role="presentation" onClick={onClose}>
      <div
        className="jb-pl-manage-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jb-pl-manage-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="jb-pl-manage-head">
          <div>
            <h2 id="jb-pl-manage-title">{PLAIN.managePlaylists}</h2>
            <p className="jb-pl-manage-hint">{PLAIN.managePlaylistsHint}</p>
          </div>
          <button type="button" className="jb-pl-manage-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {pinned.length > 0 ? (
          <ul className="jb-pl-manage-pinned" aria-label="Pinned playlists">
            {pinned.map((pl) => (
              <li key={pl.id} className="jb-pl-manage-pinned-row">
                <span className="jb-pl-manage-pinned-badge">{PLAIN.playlistPinned}</span>
                {isMasterPlaylist(pl.id) ? (
                  <span className="jb-pl-manage-pinned-icon" aria-hidden>
                    📚
                  </span>
                ) : (
                  <span className="jb-pl-manage-pinned-icon" aria-hidden>
                    ♥
                  </span>
                )}
                <span className="jb-pl-manage-pinned-name">
                  {isMasterPlaylist(pl.id) ? SONIC_CATALOG_DISPLAY_NAME : PLAIN.myLikes}
                </span>
                <span className="jb-pl-manage-pinned-count">
                  {resolvePlaylistTrackIds(pl.id, tracks, playlists).length} {PLAIN.tracks}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {userPlaylists.length === 0 ? (
          <p className="jb-pl-manage-empty">No playlists yet — tap <strong>+ New playlist</strong> to create one.</p>
        ) : (
          <ol ref={listRef} className="jb-pl-manage-list">
            {userPlaylists.map((pl, index) => {
              const isRenaming = renameId === pl.id;
              const count = resolvePlaylistTrackIds(pl.id, tracks, playlists).length;
              const dragging = dragIndex === index;
              const dropBefore = overIndex === index && dragIndex !== null && dragIndex !== index;
              return (
                <li
                  key={pl.id}
                  data-reorder-idx={index}
                  className={`jb-pl-manage-row${dragging ? ' jb-pl-manage-row--dragging' : ''}${dropBefore ? ' jb-pl-manage-row--drop' : ''}${isRenaming ? ' jb-pl-manage-row--renaming' : ''}`}
                >
                  <button
                    type="button"
                    className="sp-row-grip jb-pl-manage-grip"
                    aria-label={`Reorder ${pl.name}`}
                    disabled={!canReorder}
                    onPointerDown={(e) => onGripPointerDown(index, e)}
                    onPointerMove={onGripPointerMove}
                    onPointerUp={(e) => onGripPointerUp(index, e)}
                    onPointerCancel={(e) => onGripPointerUp(index, e)}
                  >
                    ⋮⋮
                  </button>

                  <PlaylistCoverArt playlist={pl} size={40} className="jb-pl-manage-cover" />

                  {isRenaming ? (
                    <div className="jb-pl-manage-rename">
                      <input
                        ref={renameInputRef}
                        className="jb-pl-manage-rename-input"
                        value={renameDraft}
                        aria-label={PLAIN.playlistName}
                        autoComplete="off"
                        enterKeyHint="done"
                        onChange={(e) => {
                          setRenameDraft(e.target.value);
                          renameDraftRef.current = e.target.value;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            finishRename();
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelRename();
                          }
                        }}
                      />
                      <button type="button" className="jb-tool-btn jb-tool-btn--gold" onClick={finishRename}>
                        {PLAIN.save}
                      </button>
                      <button type="button" className="jb-tool-btn" onClick={cancelRename}>
                        {PLAIN.cancel}
                      </button>
                    </div>
                  ) : (
                    <div className="jb-pl-manage-meta">
                      <strong className="jb-pl-manage-name">{pl.name}</strong>
                      <span className="jb-pl-manage-count">
                        {count} {PLAIN.tracks}
                      </span>
                    </div>
                  )}

                  {!isRenaming ? (
                    <div className="jb-pl-manage-actions">
                      <button
                        type="button"
                        className="jb-tool-btn"
                        disabled={index === 0}
                        aria-label={`${PLAIN.moveUp} ${pl.name}`}
                        onClick={() => moveUserPlaylistMenu(pl.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="jb-tool-btn"
                        disabled={index === userPlaylists.length - 1}
                        aria-label={`${PLAIN.moveDown} ${pl.name}`}
                        onClick={() => moveUserPlaylistMenu(pl.id, 1)}
                      >
                        ↓
                      </button>
                      <button type="button" className="jb-tool-btn" onClick={() => onEditPlaylist(pl.id)}>
                        {PLAIN.editPlaylist}
                      </button>
                      <button type="button" className="jb-tool-btn" onClick={() => startRename(pl.id, pl.name)}>
                        {PLAIN.renamePlaylist}
                      </button>
                      <button type="button" className="jb-tool-btn" onClick={() => handleDuplicate(pl.id)}>
                        {PLAIN.duplicatePlaylist}
                      </button>
                      <button
                        type="button"
                        className="jb-tool-btn jb-tool-btn--danger"
                        onClick={() => handleDelete(pl.id, pl.name)}
                      >
                        {PLAIN.deletePlaylist}
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}

        <footer className="jb-pl-manage-foot">
          <button type="button" className="jb-link-btn" onClick={onClose}>
            {PLAIN.cancel}
          </button>
        </footer>
      </div>
    </div>
  );
}
