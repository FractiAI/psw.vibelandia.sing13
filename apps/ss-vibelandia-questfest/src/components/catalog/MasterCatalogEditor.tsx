import { useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { TrackMetadataEditor } from '@/components/catalog/TrackMetadataEditor';
import { MASTER_PLAYLIST_ID, isUserUploadTrack } from '@/lib/catalogSeed';
import { fmtDuration, fmtUploadDate } from '@/lib/formatDuration';
import { PLAIN } from '@/lib/plainSpeak';
import { TRACK_GENRE_SUGGESTIONS, type TrackDef } from '@/lib/catalogTypes';

interface MasterCatalogEditorProps {
  onDone: () => void;
}

function TrackEditRow({
  track,
  selected,
  onToggleSelect,
  disabled,
}: {
  track: TrackDef;
  selected: boolean;
  onToggleSelect: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`sp-master-edit-row${open ? ' sp-master-edit-row--open' : ''}${selected ? ' sp-master-edit-row--selected' : ''}`}>
      <div className="sp-master-edit-summary">
        <label className="sp-master-edit-check">
          <input type="checkbox" checked={selected} disabled={disabled} onChange={onToggleSelect} />
          <span className="sr-only">Select {track.title}</span>
        </label>
        {track.posterSrc ? (
          <img className="sp-master-edit-thumb" src={track.posterSrc} alt="" width={48} height={48} loading="lazy" />
        ) : (
          <span className="sp-master-edit-thumb sp-master-edit-thumb--empty" aria-hidden />
        )}
        <div className="sp-master-edit-meta">
          <strong className="sp-master-edit-title">{track.title}</strong>
          <span className="sp-master-edit-artist">{track.artist}</span>
          {track.description && <span className="sp-master-edit-desc">{track.description}</span>}
          <span className="sp-master-edit-tags">
            {track.genre && <span className="sp-master-edit-tag">{track.genre}</span>}
            {track.durationSec != null && track.durationSec > 0 && (
              <span className="sp-master-edit-tag">{fmtDuration(track.durationSec)}</span>
            )}
            {track.uploadedAt && (
              <span className="sp-master-edit-tag">{fmtUploadDate(track.uploadedAt)}</span>
            )}
          </span>
        </div>
        <button
          type="button"
          className="sp-library-btn sp-library-btn--primary"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : PLAIN.editTrack}
        </button>
      </div>
      {open && (
        <TrackMetadataEditor
          track={track}
          disabled={disabled}
          variant="panel"
          onSaved={() => setOpen(false)}
          onDeleted={() => setOpen(false)}
        />
      )}
    </li>
  );
}

export function MasterCatalogEditor({ onDone }: MasterCatalogEditorProps) {
  const getTrack = useCatalogStore((s) => s.getTrack);
  const playlists = useCatalogStore((s) => s.playlists);
  const deleteTracks = useCatalogStore((s) => s.deleteTracks);

  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const masterPl = playlists.find((p) => p.id === MASTER_PLAYLIST_ID);

  const tracks = useMemo(() => {
    const ids = masterPl?.trackIds ?? [];
    return ids
      .map((id) => getTrack(id))
      .filter((t): t is TrackDef => !!t && isUserUploadTrack(t.id, t))
      .sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''));
  }, [masterPl?.trackIds, getTrack]);

  const allSelected = tracks.length > 0 && tracks.every((t) => selected.has(t.id));
  const selectedCount = tracks.filter((t) => selected.has(t.id)).length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tracks.map((t) => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = tracks.filter((t) => selected.has(t.id)).map((t) => t.id);
    if (!ids.length) return;
    setBusy(true);
    setMsg(null);
    try {
      const removed = await deleteTracks(ids);
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of removed) next.delete(id);
        return next;
      });
      setMsg(removed.length === 1 ? '1 track deleted.' : `${removed.length} tracks deleted.`);
    } catch {
      setMsg('Delete failed — try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="sp-master-edit">
      <header className="sp-pl-edit-head">
        <button type="button" className="sp-pl-edit-back" onClick={onDone} disabled={busy}>
          Done
        </button>
      </header>

      <div className="sp-master-edit-intro">
        <h1 className="sp-library-title">{PLAIN.editMasterCatalog}</h1>
        <p className="sp-library-sub">{PLAIN.editMasterCatalogHint}</p>
      </div>

      {tracks.length === 0 ? (
        <p className="sp-empty">{PLAIN.noEditableTracks}</p>
      ) : (
        <>
          <div className="sp-master-edit-toolbar">
            <label className="sp-master-edit-check sp-master-edit-check--all">
              <input type="checkbox" checked={allSelected} disabled={busy} onChange={toggleAll} />
              <span>{allSelected ? 'Deselect all' : 'Select all'}</span>
            </label>
            <span className="sp-master-edit-count" aria-live="polite">
              {selectedCount > 0 ? `${selectedCount} selected` : `${tracks.length} tracks`}
            </span>
            <button
              type="button"
              className="sp-library-delete"
              disabled={busy || selectedCount === 0}
              onClick={() => void handleBulkDelete()}
            >
              {busy ? 'Deleting…' : PLAIN.deleteSelected}
            </button>
          </div>

          {msg && (
            <p className={`spotify-dj-msg${msg.includes('failed') ? ' spotify-dj-msg--error' : ' spotify-dj-msg--success'}`}>
              {msg}
            </p>
          )}

          <datalist id="qf-genre-suggestions">
            {TRACK_GENRE_SUGGESTIONS.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>

          <ol className="sp-master-edit-list">
            {tracks.map((tr) => (
              <TrackEditRow
                key={tr.id}
                track={tr}
                selected={selected.has(tr.id)}
                disabled={busy}
                onToggleSelect={() => toggleOne(tr.id)}
              />
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
