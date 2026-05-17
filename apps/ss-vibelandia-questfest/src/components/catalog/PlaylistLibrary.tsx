import { useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistEditor } from '@/components/catalog/PlaylistEditor';
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
  const duplicatePlaylist = useCatalogStore((s) => s.duplicatePlaylist);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const getTrack = useCatalogStore((s) => s.getTrack);

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialEditId) setEditingId(initialEditId);
  }, [initialEditId]);

  useEffect(() => {
    if (editingId && !playlists.some((p) => p.id === editingId)) {
      setEditingId(null);
    }
  }, [editingId, playlists]);

  const handleCreate = () => {
    const id = createPlaylist('New playlist');
    setActive(id);
    setEditingId(id);
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
            <strong>{PLAIN.masterCatalog}</strong> — {PLAIN.masterCatalogHint} Make a playlist, tap Edit, add songs from
            that list.
          </p>
        </div>
        <button type="button" className="sp-library-new" onClick={handleCreate}>
          + New playlist
        </button>
      </header>

      <ul className="sp-library-list">
        {sorted.map((pl) => (
          <li key={pl.id} className={`sp-library-card${pl.id === activeId ? ' sp-library-card--on' : ''}`}>
            <button type="button" className="sp-library-open" onClick={() => onOpenPlaylist(pl.id)}>
              <span className="sp-library-cover" aria-hidden>
                {isMasterPlaylist(pl.id) ? '📚' : '🎵'}
              </span>
              <span className="sp-library-meta">
                <span className="sp-library-name">
                  {pl.name}
                  {isMasterPlaylist(pl.id) && (
                    <span className="sp-library-badge"> full library </span>
                  )}
                </span>
                <span className="sp-library-count">
                  {pl.trackIds.length} {PLAIN.songs} · {fmtPlaylistTotalTime(pl.trackIds, getTrack)} {PLAIN.totalTime}
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
            <div className="sp-library-actions">
              <button
                type="button"
                className="sp-library-btn sp-library-btn--primary"
                onClick={() => setEditingId(pl.id)}
              >
                Edit
              </button>
              {!isMasterPlaylist(pl.id) && (
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
              )}
              <button type="button" className="sp-library-btn" onClick={() => onOpenPlaylist(pl.id)}>
                Play
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
