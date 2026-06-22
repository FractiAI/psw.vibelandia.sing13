import { useEffect, useId, useRef, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { normalizeCoverForUpload } from '@/lib/coverImageFile';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import {
  isMasterPlaylist,
  isMyLikesPlaylist,
  MASTER_PLAYLIST_DEFAULT_NAME,
} from '@/lib/catalogSeed';
import { PLAIN } from '@/lib/plainSpeak';

interface PlaylistMetaModalProps {
  playlistId: string;
  open: boolean;
  onClose: () => void;
}

export function PlaylistMetaModal({ playlistId, open, onClose }: PlaylistMetaModalProps) {
  const playlists = useCatalogStore((s) => s.playlists);
  const updatePlaylist = useCatalogStore((s) => s.updatePlaylist);
  const pl = playlists.find((p) => p.id === playlistId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverInputKey, setCoverInputKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const coverInputId = useId();
  const coverBlobRef = useRef<string | null>(null);

  const isMaster = pl ? isMasterPlaylist(pl.id) : false;
  const isMyLikes = pl ? isMyLikesPlaylist(pl.id) : false;

  const setCoverPreviewSafe = (url?: string) => {
    if (coverBlobRef.current) {
      URL.revokeObjectURL(coverBlobRef.current);
      coverBlobRef.current = null;
    }
    if (url?.startsWith('blob:')) coverBlobRef.current = url;
    setCoverPreview(url);
  };

  useEffect(() => {
    if (!open || !pl) return;
    setName(isMaster ? pl.name || MASTER_PLAYLIST_DEFAULT_NAME : pl.name);
    setDescription(pl.description ?? '');
    setCoverPreview(pl.posterSrc);
    setCoverFile(null);
    setCoverInputKey((k) => k + 1);
    setMsg(null);
    if (coverBlobRef.current) {
      URL.revokeObjectURL(coverBlobRef.current);
      coverBlobRef.current = null;
    }
  }, [open, pl, isMaster]);

  useEffect(() => () => {
    if (coverBlobRef.current) URL.revokeObjectURL(coverBlobRef.current);
  }, []);

  if (!open || !pl || isMyLikes) return null;

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await updatePlaylist(
        playlistId,
        { name: isMaster ? name.trim() || MASTER_PLAYLIST_DEFAULT_NAME : name, description },
        coverFile ? { coverFile, onProgress: setMsg } : undefined,
      );
      setCoverFile(null);
      setCoverInputKey((k) => k + 1);
      const latest = useCatalogStore.getState().playlists.find((p) => p.id === playlistId);
      setCoverPreviewSafe(latest?.posterSrc);
      setMsg(PLAIN.saved);
      onClose();
    } catch (e) {
      const code = (e as { code?: string }).code ?? (e instanceof Error ? e.message : '');
      if (code === 'cover_not_image') setMsg(PLAIN.coverMustBeImage);
      else if (code === 'cover_too_large' || code === 'cover_too_large_local') setMsg(PLAIN.coverTooLarge);
      else setMsg(PLAIN.saveFailed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sc-pick-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sc-meta-panel"
        role="dialog"
        aria-label={PLAIN.editPlaylist}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sc-pick-head">
          <h2>{PLAIN.editPlaylist}</h2>
          <button type="button" className="sc-pick-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="sc-meta-body">
          <div className="sc-meta-cover">
            {coverPreview ? (
              <img className="sc-meta-cover-img" src={coverPreview} alt="" width={96} height={96} />
            ) : (
              <PlaylistCoverArt playlist={pl} size={96} className="sc-meta-cover-img" />
            )}
            <div className="sc-meta-cover-actions">
              <input
                key={coverInputKey}
                id={coverInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  const picked = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  void (async () => {
                    if (!picked) {
                      setCoverFile(null);
                      setCoverPreviewSafe(pl.posterSrc);
                      return;
                    }
                    try {
                      const normalized = await normalizeCoverForUpload(picked);
                      setCoverFile(normalized);
                      setCoverPreviewSafe(URL.createObjectURL(normalized));
                      setMsg(null);
                    } catch {
                      setMsg(PLAIN.coverMustBeImage);
                    }
                  })();
                }}
              />
              <label htmlFor={coverInputId} className="sc-ghost-btn">
                {PLAIN.changeCover}
              </label>
              {(coverPreview || pl.posterSrc) && (
                <button
                  type="button"
                  className="sc-ghost-btn"
                  disabled={busy}
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreviewSafe(undefined);
                    setCoverInputKey((k) => k + 1);
                    void updatePlaylist(playlistId, { posterSrc: null });
                  }}
                >
                  {PLAIN.removeCover}
                </button>
              )}
            </div>
          </div>

          <label className="sc-meta-field">
            <span>{PLAIN.playlistName}</span>
            <input
              className="sc-search"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              autoComplete="off"
            />
          </label>

          <label className="sc-meta-field">
            <span>{PLAIN.description}</span>
            <textarea
              className="sc-meta-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={busy}
              placeholder={PLAIN.descriptionPlaceholder}
            />
          </label>

          {msg ? <p className={`sc-meta-msg${msg === PLAIN.saved ? ' sc-meta-msg--ok' : ' sc-meta-msg--err'}`}>{msg}</p> : null}

          <div className="sc-meta-actions">
            <button type="button" className="sc-play-all" disabled={busy} onClick={() => void save()}>
              {busy ? PLAIN.saving : PLAIN.save}
            </button>
            <button type="button" className="sc-ghost-btn" disabled={busy} onClick={onClose}>
              {PLAIN.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
