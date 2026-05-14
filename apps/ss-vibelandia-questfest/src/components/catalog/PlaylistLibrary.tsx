import { useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';

interface PlaylistLibraryProps {
  onOpenPlaylist: (id: string) => void;
}

export function PlaylistLibrary({ onOpenPlaylist }: PlaylistLibraryProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const updatePlaylist = useCatalogStore((s) => s.updatePlaylist);
  const deletePlaylist = useCatalogStore((s) => s.deletePlaylist);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);

  const [editingId, setEditingId] = useState<string | null>(activeId);
  const [draftName, setDraftName] = useState('');
  const [draftDesc, setDraftDesc] = useState('');

  const startEdit = (id: string) => {
    const pl = playlists.find((p) => p.id === id);
    if (!pl) return;
    setEditingId(id);
    setDraftName(pl.name);
    setDraftDesc(pl.description);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updatePlaylist(editingId, { name: draftName, description: draftDesc });
  };

  const handleCreate = () => {
    const id = createPlaylist('New playlist');
    setActive(id);
    startEdit(id);
  };

  const handleDelete = (id: string) => {
    if (playlists.length <= 1) return;
    if (!window.confirm('Delete this playlist? Tracks stay in your catalog.')) return;
    deletePlaylist(id);
    if (editingId === id) setEditingId(null);
  };

  return (
    <section className="sp-library">
      <header className="sp-library-head">
        <div>
          <h1 className="sp-library-title">Your playlists</h1>
          <p className="sp-library-sub">Create playlists, add songs from your catalog, drag to reorder on Listen.</p>
        </div>
        <button type="button" className="sp-library-new" onClick={handleCreate}>
          + New playlist
        </button>
      </header>

      <ul className="sp-library-list">
        {playlists.map((pl) => {
          const editing = editingId === pl.id;
          return (
            <li key={pl.id} className={`sp-library-card${pl.id === activeId ? ' sp-library-card--on' : ''}`}>
              <button
                type="button"
                className="sp-library-open"
                onClick={() => onOpenPlaylist(pl.id)}
              >
                <span className="sp-library-cover" aria-hidden>🎵</span>
                <span className="sp-library-meta">
                  <span className="sp-library-name">{pl.name}</span>
                  <span className="sp-library-count">{pl.trackIds.length} songs</span>
                  {pl.description && <span className="sp-library-desc">{pl.description}</span>}
                </span>
              </button>
              <div className="sp-library-actions">
                <button type="button" className="sp-library-btn" onClick={() => startEdit(pl.id)}>
                  Edit
                </button>
                <button type="button" className="sp-library-btn" onClick={() => onOpenPlaylist(pl.id)}>
                  Open
                </button>
              </div>

              {editing && (
                <div className="sp-library-editor">
                  <label className="sp-library-field">
                    Name
                    <input
                      className="sp-library-input"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Playlist name"
                    />
                  </label>
                  <label className="sp-library-field">
                    Description
                    <textarea
                      className="sp-library-input sp-library-textarea"
                      value={draftDesc}
                      onChange={(e) => setDraftDesc(e.target.value)}
                      rows={3}
                      placeholder="What's this playlist for?"
                    />
                  </label>
                  <div className="sp-library-editor-actions">
                    <button type="button" className="sp-library-save" onClick={saveEdit}>
                      Save
                    </button>
                    {playlists.length > 1 && (
                      <button
                        type="button"
                        className="sp-library-delete"
                        onClick={() => handleDelete(pl.id)}
                      >
                        Delete playlist
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
