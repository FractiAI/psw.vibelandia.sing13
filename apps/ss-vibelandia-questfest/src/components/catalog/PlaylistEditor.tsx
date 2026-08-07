import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { playTrackById } from '@/lib/trackPlayback';
import { normalizeCoverForUpload } from '@/lib/coverImageFile';
import { useCatalogStore } from '@/stores/catalogStore';
import { usePlaybackStore } from '@/stores/playbackStore';
import { usePlaylistReorder } from '@/hooks/usePlaylistReorder';
import { isMasterPlaylist, isMyLikesPlaylist, MASTER_PLAYLIST_ID } from '@/lib/catalogSeed';
import { fmtPlaylistTotalTime } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import { isBlankDraftPlaylist } from '@/lib/playlistDrafts';
import { nestablePlaylistsForParent } from '@/lib/playlistNest';
import {
  MASTER_LIBRARY_UI_HINT,
  PLAYLIST_KIND_HINT,
  PLAYLIST_KIND_OPEN_LABEL,
  PLAYLIST_KIND_SOVEREIGN_LABEL,
  SONIC_SINGULARITY_DESCRIPTION,
} from '@/lib/sonicCatalogCopy';
import type { PlaylistKind } from '@/lib/catalogTypes';
import { TRACK_GENRE_MAX, TRACK_GENRE_SUGGESTIONS } from '@/lib/catalogTypes';
import { PlaylistCoverArt } from '@/components/catalog/PlaylistCoverArt';
import { TrackEditModal } from '@/components/catalog/TrackEditModal';

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
  const getChildPlaylists = useCatalogStore((s) => s.getChildPlaylists);
  const addPlaylistToPlaylist = useCatalogStore((s) => s.addPlaylistToPlaylist);
  const removePlaylistFromPlaylist = useCatalogStore((s) => s.removePlaylistFromPlaylist);
  const createPlaylist = useCatalogStore((s) => s.createPlaylist);
  const setActivePlaylist = useCatalogStore((s) => s.setActivePlaylist);
  const currentTrackId = usePlaybackStore((s) => s.currentTrackId);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);

  const pl = playlists.find((p) => p.id === playlistId);
  const masterPl = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [kind, setKind] = useState<PlaylistKind>('sovereign');
  const [coverPreview, setCoverPreview] = useState<string | undefined>();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverInputKey, setCoverInputKey] = useState(0);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverMsg, setCoverMsg] = useState<string | null>(null);
  const coverInputId = useId();
  const coverBlobRef = useRef<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [editTrackId, setEditTrackId] = useState<string | null>(null);
  const [menuTrackId, setMenuTrackId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isMaster = isMasterPlaylist(playlistId);
  const isMyLikes = isMyLikesPlaylist(playlistId);

  useEffect(() => {
    const current = useCatalogStore.getState().playlists.find((p) => p.id === playlistId);
    if (!current) return;
    setName(current.name);
    setDescription(current.description);
    setGenre(current.genre ?? '');
    setKind(current.kind);
    setCoverPreview(current.posterSrc);
    setCoverFile(null);
    setCoverInputKey((k) => k + 1);
    setCoverMsg(null);
    if (coverBlobRef.current) {
      URL.revokeObjectURL(coverBlobRef.current);
      coverBlobRef.current = null;
    }
    setShowAdd(false);
    setAddSearch('');
    setEditTrackId(null);
    setMenuTrackId(null);
  }, [playlistId]);

  useEffect(() => {
    if (!menuTrackId) return;
    const onDoc = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuTrackId(null);
      }
    };
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, [menuTrackId]);

  const setCoverPreviewSafe = (url?: string) => {
    if (coverBlobRef.current) {
      URL.revokeObjectURL(coverBlobRef.current);
      coverBlobRef.current = null;
    }
    if (url?.startsWith('blob:')) coverBlobRef.current = url;
    setCoverPreview(url);
  };

  useEffect(() => {
    return () => {
      if (coverBlobRef.current) URL.revokeObjectURL(coverBlobRef.current);
    };
  }, []);

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

  const childPlaylists = useMemo(
    () => (isMaster || isMyLikes ? [] : getChildPlaylists(playlistId)),
    [getChildPlaylists, isMaster, isMyLikes, playlistId],
  );

  const nestCandidates = useMemo(
    () => (isMaster || isMyLikes ? [] : nestablePlaylistsForParent(playlistId, playlists)),
    [isMaster, isMyLikes, playlistId, playlists],
  );

  const playTrack = (id: string) => {
    setActivePlaylist(playlistId);
    playTrackById(id, getTrack, { playbackPlaylistId: playlistId });
  };

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

  const saveMeta = async (fileOverride?: File | null) => {
    if (isMyLikes) return;
    const file = fileOverride !== undefined ? fileOverride : coverFile;
    setCoverBusy(true);
    setCoverMsg(null);
    try {
      await updatePlaylist(
        playlistId,
        { name, description, genre, kind },
        file ? { coverFile: file, onProgress: setCoverMsg } : undefined,
      );
      setCoverFile(null);
      setCoverInputKey((k) => k + 1);
      const latest = useCatalogStore.getState().playlists.find((p) => p.id === playlistId);
      setCoverPreviewSafe(latest?.posterSrc);
      setCoverMsg('Saved');
    } catch (e) {
      const code = (e as { code?: string }).code ?? (e instanceof Error ? e.message : '');
      if (code === 'cover_not_image') {
        setCoverMsg('Cover must be JPEG, PNG, or WebP.');
      } else if (code === 'cover_too_large' || code === 'cover_too_large_local') {
        setCoverMsg('Cover image is too large — try a smaller photo.');
      } else {
        setCoverMsg('Save failed — try again.');
      }
    } finally {
      setCoverBusy(false);
    }
  };

  const handleDone = () => {
    void saveMeta().finally(() => {
      const current = useCatalogStore.getState().playlists.find((p) => p.id === playlistId);
      if (current && isBlankDraftPlaylist(current)) {
        deletePlaylist(playlistId);
      }
      onDone();
    });
  };

  const handleDelete = () => {
    if (isMaster || isMyLikes) return;
    if (playlists.length <= 1) return;
    if (!window.confirm('Delete this playlist? Tracks stay in the Master catalog.')) return;
    deletePlaylist(playlistId);
    onDone();
  };

  const addTrack = (trackId: string) => {
    addTrackToPlaylist(trackId, playlistId);
  };

  const handleDuplicate = () => {
    if (isMaster || isMyLikes) return;
    void saveMeta().then(() => {
      const newId = duplicatePlaylist(playlistId);
      if (newId) onDuplicated?.(newId);
    });
  };

  const pickCover = async (picked: File | null) => {
    if (!picked) {
      setCoverFile(null);
      setCoverPreviewSafe(pl.posterSrc);
      return;
    }
    try {
      const normalized = await normalizeCoverForUpload(picked);
      setCoverFile(normalized);
      setCoverPreviewSafe(URL.createObjectURL(normalized));
      setCoverMsg(null);
      await saveMeta(normalized);
    } catch {
      setCoverMsg('Could not use that image — try JPEG or PNG.');
    }
  };

  const coverMsgBad =
    !!coverMsg &&
    (coverMsg.startsWith('Save failed') || coverMsg.includes('must be') || coverMsg.includes('too large') || coverMsg.includes('Could not'));

  return (
    <section className="sp-pl-edit sp-pl-edit--sc">
      <header className="sp-pl-edit-head">
        <button type="button" className="sp-pl-edit-back" onClick={handleDone}>
          Done
        </button>
        <span className="sp-pl-edit-head-title">Edit playlist</span>
        {onPlay ? (
          <button type="button" className="sp-pl-edit-play" onClick={onPlay}>
            Play
          </button>
        ) : (
          <span className="sp-pl-edit-head-spacer" aria-hidden />
        )}
      </header>

      {isMaster && (
        <p className="sp-pl-edit-banner">
          {SONIC_SINGULARITY_DESCRIPTION}
          <span className="sp-pl-edit-banner-hint">{MASTER_LIBRARY_UI_HINT}</span>
        </p>
      )}

      {isMyLikes && <p className="sp-pl-edit-banner">{PLAIN.myLikesHint}</p>}

      {!isMyLikes && (
        <div className="sp-pl-edit-hero">
          <datalist id="qf-genre-suggestions-playlist">
            {TRACK_GENRE_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>

          <input
            key={coverInputKey}
            id={coverInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*,.jpg,.jpeg,.png,.webp,.heic"
            className="sp-pl-edit-hero-file"
            disabled={coverBusy}
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null;
              e.target.value = '';
              void pickCover(picked);
            }}
          />

          <label htmlFor={coverInputId} className="sp-pl-edit-hero-cover" aria-label={PLAIN.changeCover}>
            {coverPreview ? (
              <img src={coverPreview} alt="" width={160} height={160} />
            ) : (
              <PlaylistCoverArt playlist={pl} className="sp-pl-edit-hero-cover-fallback" size={160} />
            )}
            <span className="sp-pl-edit-hero-cover-badge">{coverBusy ? 'Saving…' : PLAIN.changeCover}</span>
          </label>

          <div className="sp-pl-edit-hero-fields">
            <label className="sp-pl-edit-hero-title-field">
              <span className="sp-visually-hidden">{PLAIN.title}</span>
              <input
                className="sp-pl-edit-hero-title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (name.trim() && name !== pl.name) void saveMeta();
                }}
                placeholder="Playlist title"
                autoComplete="off"
                enterKeyHint="done"
              />
            </label>
            <p className="sp-pl-edit-hero-stats">
              {playlistTracks.length} {PLAIN.songs} · {fmtPlaylistTotalTime(pl.trackIds, getTrack)}
            </p>
            {coverMsg && (
              <span
                className={`spotify-dj-msg${coverMsgBad ? ' spotify-dj-msg--error' : coverMsg === 'Saved' ? ' spotify-dj-msg--success' : ''}`}
              >
                {coverMsg}
              </span>
            )}
            {(coverPreview || pl.posterSrc) && (
              <button
                type="button"
                className="sp-pl-edit-hero-remove-cover"
                disabled={coverBusy}
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
      )}

      {!isMyLikes && (
        <details className="sp-pl-edit-more">
          <summary>More details</summary>
          <div className="sp-pl-edit-more-body">
            <label className="sp-library-field">
              {PLAIN.genre}
              <input
                className="sp-library-input"
                list="qf-genre-suggestions-playlist"
                value={genre}
                onChange={(e) => setGenre(e.target.value.slice(0, TRACK_GENRE_MAX))}
                onBlur={() => void saveMeta()}
                placeholder={PLAIN.genrePlaceholder}
                autoComplete="off"
              />
            </label>
            <label className="sp-library-field">
              {PLAIN.description}
              <textarea
                className="sp-library-input sp-library-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => void saveMeta()}
                rows={2}
                placeholder={PLAIN.descriptionPlaceholder}
              />
            </label>
            {!isMaster ? (
              <fieldset className="sp-library-field sp-pl-visibility">
                <legend>Who can listen</legend>
                <label className="sp-pl-visibility__opt">
                  <input
                    type="radio"
                    name={`pl-kind-${playlistId}`}
                    checked={kind === 'sovereign'}
                    onChange={() => {
                      setKind('sovereign');
                      void updatePlaylist(playlistId, { kind: 'sovereign' });
                    }}
                  />
                  {PLAYLIST_KIND_SOVEREIGN_LABEL}
                </label>
                <label className="sp-pl-visibility__opt">
                  <input
                    type="radio"
                    name={`pl-kind-${playlistId}`}
                    checked={kind === 'open_deck'}
                    onChange={() => {
                      setKind('open_deck');
                      void updatePlaylist(playlistId, { kind: 'open_deck' });
                    }}
                  />
                  {PLAYLIST_KIND_OPEN_LABEL}
                </label>
                <span className="spotify-field-hint">{PLAYLIST_KIND_HINT}</span>
              </fieldset>
            ) : null}

            {!isMaster && (
              <div className="sc-nest-editor sc-nest-editor--compact">
                <div className="sc-nest-editor-head">
                  <h2>{PLAIN.nestedPlaylists}</h2>
                  <button
                    type="button"
                    className="sc-ghost-btn"
                    onClick={() => {
                      const newId = createPlaylist(PLAIN.newPlaylist, playlistId);
                      onDuplicated?.(newId);
                    }}
                  >
                    + {PLAIN.newNestedPlaylist}
                  </button>
                </div>
                {childPlaylists.length > 0 ? (
                  <ul className="sc-nest-editor-list">
                    {childPlaylists.map((child) => (
                      <li key={child.id} className="sc-nest-editor-row">
                        <PlaylistCoverArt playlist={child} size={36} />
                        <span className="sc-nest-editor-name">{child.name}</span>
                        <button
                          type="button"
                          className="sc-ghost-btn"
                          onClick={() => removePlaylistFromPlaylist(child.id, playlistId)}
                        >
                          {PLAIN.removeNested}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="sc-nest-editor-empty">{PLAIN.emptyPlaylist}</p>
                )}
                {nestCandidates.length > 0 ? (
                  <label className="sc-nest-picker">
                    <span>{PLAIN.addNestedPlaylist}</span>
                    <select
                      className="sc-nest-select"
                      defaultValue=""
                      onChange={(e) => {
                        const id = e.target.value;
                        e.target.value = '';
                        if (id) addPlaylistToPlaylist(id, playlistId);
                      }}
                    >
                      <option value="" disabled>
                        Choose playlist…
                      </option>
                      {nestCandidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            )}
          </div>
        </details>
      )}

      <div className="sp-pl-edit-tracks">
        <div className="sp-pl-edit-tracks-bar">
          <h2 className="sp-pl-edit-tracks-title">Tracks</h2>
          {!isMaster && !isMyLikes && (
            <button
              type="button"
              className="sp-pl-edit-add-toggle"
              onClick={() => setShowAdd((v) => !v)}
              aria-expanded={showAdd}
            >
              {showAdd ? 'Close' : '+ Add'}
            </button>
          )}
        </div>

        {!isMaster && !isMyLikes && showAdd && (
          <div className="sp-pl-edit-add-panel">
            <input
              className="sp-search sp-pl-edit-add-search"
              type="search"
              placeholder="Search Master catalog"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              autoFocus
            />
            {masterTrackCount === 0 ? (
              <p className="sp-pl-edit-add-empty">Master catalog is empty — add tracks on the Upload tab first.</p>
            ) : availableTracks.length === 0 ? (
              <p className="sp-pl-edit-add-empty">Every song from the Master catalog is already in this playlist.</p>
            ) : (
              <ul className="sp-pl-edit-add-list">
                {availableTracks.map((tr) => (
                  <li key={tr.id} className="sp-pl-edit-add-row">
                    <span className="sp-pl-edit-track-info">
                      <strong>{tr.title}</strong>
                      <span>{tr.artist}</span>
                    </span>
                    <button type="button" className="sp-pl-edit-add-btn" onClick={() => addTrack(tr.id)}>
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
              <>
                No uploads yet. Use the <strong>Upload</strong> tab.
              </>
            ) : isMyLikes ? (
              <>
                No likes yet. Tap the <strong>♥</strong> on any track while you listen.
              </>
            ) : (
              <>
                No songs yet. Tap <strong>+ Add</strong> above.
              </>
            )}
          </p>
        ) : (
          <>
            {canReorder && (
              <p className="sp-reorder-hint sp-pl-edit-hint">Hold the ⋮⋮ handle to drag · tap a song to edit</p>
            )}
            {!canReorder && <p className="sp-reorder-hint sp-pl-edit-hint">Tap a song to edit name &amp; cover</p>}
            <ol className="sp-pl-edit-list" ref={listRef}>
              {playlistTracks.map((row, displayIndex) => {
                const tr = row.track;
                const dragging = dragIndex === row.index;
                const dropBefore =
                  overIndex === row.index && dragIndex !== null && dragIndex !== row.index;
                const thumb = tr.posterSrc || undefined;
                const menuOpen = menuTrackId === tr.id;
                return (
                  <li
                    key={tr.id}
                    data-reorder-idx={row.index}
                    className={`sp-pl-edit-row sp-pl-edit-row--sc${isMaster ? ' sp-pl-edit-row--master' : ''}${dragging ? ' sp-pl-edit-row--dragging' : ''}${dropBefore ? ' sp-pl-edit-row--drop' : ''}`}
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
                    <button
                      type="button"
                      className="sp-pl-edit-track-main"
                      onClick={() => {
                        setMenuTrackId(null);
                        setEditTrackId(tr.id);
                      }}
                      aria-label={`Edit ${tr.title}`}
                    >
                      {thumb ? (
                        <img className="sp-track-cover-thumb" src={thumb} alt="" width={48} height={48} />
                      ) : (
                        <span className="sp-track-cover-thumb sp-track-cover-thumb--empty" aria-hidden />
                      )}
                      <span className="sp-pl-edit-track-info">
                        <strong>{tr.title}</strong>
                        <span>{tr.artist}</span>
                      </span>
                    </button>
                    <div className="sp-pl-edit-row-menu" ref={menuOpen ? menuRef : undefined}>
                      <button
                        type="button"
                        className="sp-pl-edit-more-btn"
                        aria-label={`More for ${tr.title}`}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuTrackId(menuOpen ? null : tr.id)}
                      >
                        ⋯
                      </button>
                      {menuOpen && (
                        <div className="sp-pl-edit-menu-pop" role="menu">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuTrackId(null);
                              setEditTrackId(tr.id);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setMenuTrackId(null);
                              playTrack(tr.id);
                            }}
                          >
                            {currentTrackId === tr.id && isPlaying ? 'Playing' : 'Play'}
                          </button>
                          {!isMaster && (
                            <button
                              type="button"
                              role="menuitem"
                              className="sp-pl-edit-menu-pop--danger"
                              onClick={() => {
                                setMenuTrackId(null);
                                removeTrackFromPlaylist(tr.id, playlistId);
                              }}
                            >
                              {isMyLikes ? 'Unlike' : 'Remove'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      {editTrackId && getTrack(editTrackId) ? (
        <TrackEditModal track={getTrack(editTrackId)!} open onClose={() => setEditTrackId(null)} />
      ) : null}

      {!isMaster && !isMyLikes && (
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
