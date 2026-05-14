import { useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';

export function DjStudio() {
  const playlists = useCatalogStore((s) => s.playlists);
  const activeId = useCatalogStore((s) => s.activePlaylistId);
  const setActive = useCatalogStore((s) => s.setActivePlaylist);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const renamePlaylist = useCatalogStore((s) => s.renamePlaylist);
  const deletePlaylist = useCatalogStore((s) => s.deletePlaylist);
  const addTrackToPlaylist = useCatalogStore((s) => s.addTrackToPlaylist);
  const removeTrackFromPlaylist = useCatalogStore((s) => s.removeTrackFromPlaylist);
  const moveTrackInPlaylist = useCatalogStore((s) => s.moveTrackInPlaylist);
  const uploadTrack = useCatalogStore((s) => s.uploadTrack);
  const deleteTrack = useCatalogStore((s) => s.deleteTrack);
  const listAllTracks = useCatalogStore((s) => s.listAllTracks);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Hero Jo Golden Bachdoor');
  const [file, setFile] = useState<File | null>(null);
  const [uploadPlaylists, setUploadPlaylists] = useState<string[]>(['pl-main', 'pl-broadcast']);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [newPlName, setNewPlName] = useState('');
  const [rename, setRename] = useState('');
  const [addTrackId, setAddTrackId] = useState('');

  const active = playlists.find((p) => p.id === activeId);

  const toggleUploadPl = (id: string) => {
    setUploadPlaylists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleUpload = async () => {
    if (!file) {
      setMsg('Step 1: pick an audio or video file.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const id = await uploadTrack(file, {
        title,
        artist,
        playlistIds: uploadPlaylists.length ? uploadPlaylists : ['pl-main'],
      });
      setMsg(`Uploaded “${title || file.name}” — track id ${id}.`);
      setTitle('');
      setFile(null);
    } catch {
      setMsg('Upload failed. Try a smaller file or another format.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="spotify-main-panel spotify-dj">
      <header className="spotify-main-head">
        <div>
          <p className="spotify-main-eyebrow">DJ Studio</p>
          <h2 className="spotify-main-title">Upload &amp; edit playlists</h2>
          <p className="spotify-main-desc">
            Three steps: upload a track, assign playlists, reorder the broadcast. Saved in this browser.
          </p>
        </div>
      </header>

      <div className="spotify-dj-grid">
        <article className="spotify-dj-card">
          <h3>1 · Upload a track</h3>
          <label className="spotify-field">
            Title
            <input
              className="spotify-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
            />
          </label>
          <label className="spotify-field">
            Artist
            <input
              className="spotify-input"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </label>
          <label className="spotify-field">
            Audio or video file
            <input
              className="spotify-input"
              type="file"
              accept="audio/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <fieldset className="spotify-field">
            <legend>Add to playlists</legend>
            <div className="spotify-check-grid">
              {playlists.map((pl) => (
                <label key={pl.id} className="spotify-check">
                  <input
                    type="checkbox"
                    checked={uploadPlaylists.includes(pl.id)}
                    onChange={() => toggleUploadPl(pl.id)}
                  />
                  {pl.name}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" className="spotify-btn spotify-btn--gold" disabled={busy} onClick={handleUpload}>
            {busy ? 'Uploading…' : 'Upload to catalog'}
          </button>
          {msg && <p className="spotify-dj-msg">{msg}</p>}
        </article>

        <article className="spotify-dj-card">
          <h3>2 · Edit playlists</h3>
          <label className="spotify-field">
            Active playlist
            <select
              className="spotify-input"
              value={activeId}
              onChange={(e) => setActive(e.target.value)}
            >
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
            </select>
          </label>
          <div className="spotify-dj-row">
            <input
              className="spotify-input"
              placeholder="Rename playlist"
              value={rename}
              onChange={(e) => setRename(e.target.value)}
            />
            <button
              type="button"
              className="spotify-btn"
              onClick={() => {
                if (rename.trim()) renamePlaylist(activeId, rename);
                setRename('');
              }}
            >
              Rename
            </button>
          </div>
          <div className="spotify-dj-row">
            <input
              className="spotify-input"
              placeholder="New playlist name"
              value={newPlName}
              onChange={(e) => setNewPlName(e.target.value)}
            />
            <button
              type="button"
              className="spotify-btn"
              onClick={() => {
                createPlaylist(newPlName);
                setNewPlName('');
              }}
            >
              Create
            </button>
            <button
              type="button"
              className="spotify-btn spotify-btn--ghost"
              onClick={() => deletePlaylist(activeId)}
            >
              Delete
            </button>
          </div>

          <label className="spotify-field">
            Add existing track to this playlist
            <div className="spotify-dj-row">
              <select
                className="spotify-input"
                value={addTrackId}
                onChange={(e) => setAddTrackId(e.target.value)}
              >
                <option value="">Pick a track…</option>
                {listAllTracks()
                  .slice(-80)
                  .reverse()
                  .map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.title} — {tr.artist}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                className="spotify-btn"
                disabled={!addTrackId}
                onClick={() => {
                  addTrackToPlaylist(addTrackId, activeId);
                  setAddTrackId('');
                }}
              >
                Add
              </button>
            </div>
          </label>
        </article>

        <article className="spotify-dj-card spotify-dj-card--wide">
          <h3>3 · Order tracks in “{active?.name}”</h3>
          <ol className="spotify-dj-order">
            {(active?.trackIds ?? []).map((tid, idx) => {
              const tr = getTrack(tid);
              if (!tr) return null;
              return (
                <li key={tid} className="spotify-dj-order-row">
                  <span className="spotify-dj-order-idx">{idx + 1}</span>
                  <span className="spotify-dj-order-title">{tr.title}</span>
                  <span className="spotify-dj-order-artist">{tr.artist}</span>
                  <div className="spotify-dj-order-actions">
                    <button type="button" className="spotify-btn spotify-btn--tiny" onClick={() => moveTrackInPlaylist(activeId, tid, -1)}>
                      ↑
                    </button>
                    <button type="button" className="spotify-btn spotify-btn--tiny" onClick={() => moveTrackInPlaylist(activeId, tid, 1)}>
                      ↓
                    </button>
                    <button
                      type="button"
                      className="spotify-btn spotify-btn--tiny spotify-btn--ghost"
                      onClick={() => removeTrackFromPlaylist(tid, activeId)}
                    >
                      Remove
                    </button>
                    {tr.localMediaKey && (
                      <button
                        type="button"
                        className="spotify-btn spotify-btn--tiny spotify-btn--ghost"
                        onClick={() => deleteTrack(tid)}
                      >
                        Delete upload
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </article>
      </div>
    </section>
  );
}
