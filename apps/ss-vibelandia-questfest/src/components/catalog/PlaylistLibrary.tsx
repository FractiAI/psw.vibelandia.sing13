import { useEffect, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { PlaylistEditor } from '@/components/catalog/PlaylistEditor';

interface PlaylistLibraryProps {
  onOpenPlaylist: (id: string) => void;
  initialEditId?: string | null;
}

export function PlaylistLibrary({ onOpenPlaylist, initialEditId = null }: PlaylistLibraryProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialEditId) setEditingId(initialEditId);
  }, [initialEditId]);

  const handleCreate = () => {
    const id = createPlaylist('New playlist');
    setActive(id);
    setEditingId(id);
  };

  if (editingId && playlists.some((p) => p.id === editingId)) {
    return (
      <PlaylistEditor
        playlistId={editingId}
        onDone={() => setEditingId(null)}
        onPlay={() => onOpenPlaylist(editingId)}
      />
    );
  }

  return (
    <section className="sp-library">
      <header className="sp-library-head">
        <div>
          <h1 className="sp-library-title">Your playlists</h1>
          <p className="sp-library-sub">Tap Edit to add, remove, and reorder songs in one place.</p>
        </div>
        <button type="button" className="sp-library-new" onClick={handleCreate}>
          + New playlist
        </button>
      </header>

      <ul className="sp-library-list">
        {playlists.map((pl) => (
          <li key={pl.id} className={`sp-library-card${pl.id === activeId ? ' sp-library-card--on' : ''}`}>
            <button type="button" className="sp-library-open" onClick={() => onOpenPlaylist(pl.id)}>
              <span className="sp-library-cover" aria-hidden>🎵</span>
              <span className="sp-library-meta">
                <span className="sp-library-name">{pl.name}</span>
                <span className="sp-library-count">{pl.trackIds.length} songs</span>
                {pl.description && <span className="sp-library-desc">{pl.description}</span>}
              </span>
            </button>
            <div className="sp-library-actions">
              <button type="button" className="sp-library-btn sp-library-btn--primary" onClick={() => setEditingId(pl.id)}>
                Edit
              </button>
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
