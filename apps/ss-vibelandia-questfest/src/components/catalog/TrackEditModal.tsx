import type { TrackDef } from '@/lib/catalogTypes';
import { TrackMetadataEditor } from '@/components/catalog/TrackMetadataEditor';
import { PLAIN } from '@/lib/plainSpeak';
import { isUserUploadTrack } from '@/lib/catalogSeed';

interface TrackEditModalProps {
  track: TrackDef;
  open: boolean;
  onClose: () => void;
}

export function TrackEditModal({ track, open, onClose }: TrackEditModalProps) {
  if (!open) return null;

  const canDelete = isUserUploadTrack(track.id, track);

  return (
    <div className="sc-pick-backdrop sc-pick-backdrop--sheet" role="presentation" onClick={onClose}>
      <div
        className="sc-meta-panel sc-meta-panel--sheet"
        role="dialog"
        aria-label={PLAIN.editTrack}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sc-sheet-handle" aria-hidden>
          <span />
        </div>
        <div className="sc-pick-head sc-pick-head--sheet">
          <button type="button" className="sc-sheet-cancel" onClick={onClose}>
            Cancel
          </button>
          <h2>{PLAIN.editTrack}</h2>
          <span className="sc-sheet-head-spacer" aria-hidden />
        </div>
        <div className="sc-meta-body sc-meta-body--sheet">
          <TrackMetadataEditor
            track={track}
            variant="sheet"
            onSaved={onClose}
            onDeleted={canDelete ? onClose : undefined}
          />
        </div>
      </div>
    </div>
  );
}
