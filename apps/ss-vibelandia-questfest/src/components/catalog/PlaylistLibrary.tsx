import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistEditor } from '@/components/catalog/PlaylistEditor';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import { isMasterPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { fmtPlaylistTotalTime } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import { MASTER_LIBRARY_UI_HINT, SONIC_SINGULARITY_TAGLINE } from '@/lib/sonicCatalogCopy';

interface PlaylistLibraryProps {
  onOpenPlaylist: (id: string) => void;
  initialEditId?: string | null;
  onClearInitialEdit?: () => void;
}

function sortPlaylists<T extends { id: string; name: string }>(playlists: T[]): T[] {
  return [...playlists].sort((a, b) => {
    if (a.id === MASTER_PLAYLIST_ID) return -1;
    if (b.id === MASTER_PLAYLIST_ID) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export function PlaylistLibrary({
  onOpenPlaylist,
  initialEditId = null,
  onClearInitialEdit,
}: PlaylistLibraryProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const renamePlaylist = useCatalogStore((s) => s.renamePlaylist);
  const duplicatePlaylist = useCatalogStore((s) => s.duplicatePlaylist);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const getTrack = useCatalogStore((s) => s.getTrack);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const renameDraftRef = useRef('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    renameDraftRef.current = renameDraft;
  }, [renameDraft]);

  useEffect(() => {
    if (initialEditId) setEditingId(initialEditId);
  }, [initialEditId]);

  useEffect(() => {
    if (editingId && !playlists.some((p) => p.id === editingId)) {
      setEditingId(null);
    }
  }, [editingId, playlists]);

  useEffect(() => {
    if (!renameId) return;
    const t = window.setTimeout(() => {
      const el = renameInputRef.current;
      if (!el) return;
      el.focus();
      el.select();
    }, 80);
    return () => window.clearTimeout(t);
  }, [renameId]);

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

  /** Create only — stay on list; name via explicit Save (no blur / no nested button). */
  const handleCreate = () => {
    const id = createPlaylist('New playlist');
    setActive(id);
    startRename(id, 'New playlist');
  };

  const sorted = useMemo(() => sortPlaylists(playlists), [playlists]);

  if (editingId && playlists.some((p) => p.id === editingId)) {
    return (
      <PlaylistEditor
        key={editingId}
        playlistId={editingId}
        onDone={() => {
          setEditingId(null);
          onClearInitialEdit?.();
        }}
        onPlay={() => onOpenPlaylist(editingId)}
        onDuplicated={(newId) => setEditingId(newId)}
      />
    );
  }

  return (
    <section className="sp-library">
      <header className="sp-library-head">
        <div>
          <h1 className="sp-library-title">{PLAIN.yourPlaylists}</h1>
          <p className="sp-library-sub">
            Tap <strong>+ New playlist</strong>, enter a name and tap <strong>Save name</strong>, then{' '}
            <strong>Edit</strong> to add songs from the Master catalog.
          </p>
        </div>
        <button type="button" className="sp-library-new" onClick={handleCreate}>
          + New playlist
        </button>
      </header>

      <ul className="sp-library-list">
        {sorted.map((pl) => {
          const isRenaming = renameId === pl.id && !isMasterPlaylist(pl.id);
          return (
            <li
              key={pl.id}
              className={`sp-library-card${pl.id === activeId ? ' sp-library-card--on' : ''}${isRenaming ? ' sp-library-card--renaming' : ''}`}
            >
              {isRenaming ? (
                <div className="sp-library-rename-panel">
                  <span className="sp-library-cover" aria-hidden>
                    <PlaylistCoverArt playlist={pl} className="sp-library-cover-inner" size={48} />
                  </span>
                  <div className="sp-library-rename-form">
                    <label className="sp-library-field" htmlFor={`pl-rename-${pl.id}`}>
                      Playlist name
                    </label>
                    <input
                      ref={renameInputRef}
                      id={`pl-rename-${pl.id}`}
                      className="sp-library-input sp-library-rename"
                      value={renameDraft}
                      aria-label="Playlist name"
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
                    <div className="sp-library-rename-actions">
                      <button type="button" className="sp-library-btn sp-library-btn--primary" onClick={finishRename}>
                        Save name
                      </button>
                      <button type="button" className="sp-library-btn" onClick={cancelRename}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button type="button" className="sp-library-open" onClick={() => onOpenPlaylist(pl.id)}>
                  <span className="sp-library-cover" aria-hidden>
                    {isMasterPlaylist(pl.id) ? (
                      '📚'
                    ) : (
                      <PlaylistCoverArt playlist={pl} className="sp-library-cover-inner" size={48} />
                    )}
                  </span>
                  <span className="sp-library-meta">
                    <span className="sp-library-name">
                      {pl.name}
                      {isMasterPlaylist(pl.id) && <span className="sp-library-badge"> full library </span>}
                    </span>
                    <span className="sp-library-count">
                      {pl.trackIds.length} {PLAIN.songs} · {fmtPlaylistTotalTime(pl.trackIds, getTrack)}{' '}
                      {PLAIN.totalTime}
                    </span>
                    {isMasterPlaylist(pl.id) ? (
                      <>
                        <span className="sp-library-desc">{SONIC_SINGULARITY_TAGLINE}</span>
                        <span className="sp-library-desc sp-library-desc--hint">{MASTER_LIBRARY_UI_HINT}</span>
                      </>
                    ) : (
                      pl.description && <span className="sp-library-desc">{pl.description}</span>
                    )}
                  </span>
                </button>
              )}
              <div className="sp-library-actions">
                {!isMasterPlaylist(pl.id) && !isRenaming && (
                  <>
                    <button
                      type="button"
                      className="sp-library-btn sp-library-btn--primary"
                      onClick={() => setEditingId(pl.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="sp-library-btn"
                      onClick={() => startRename(pl.id, pl.name)}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="sp-library-btn"
                      onClick={() => {
                        const newId = duplicatePlaylist(pl.id);
                        if (newId) setEditingId(newId);
                      }}
                    >
                      Duplicate
                    </button>
                  </>
                )}
                {!isRenaming && (
                  <button type="button" className="sp-library-btn" onClick={() => onOpenPlaylist(pl.id)}>
                    Play
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
