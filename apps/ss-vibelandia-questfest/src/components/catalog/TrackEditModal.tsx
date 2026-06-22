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
    <div className="sc-pick-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sc-meta-panel sc-meta-panel--wide"
        role="dialog"
        aria-label={PLAIN.editTrack}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sc-pick-head">
          <h2>{PLAIN.editTrack}</h2>
          <button type="button" className="sc-pick-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="sc-meta-body">
          <p className="sc-meta-subtitle">{track.title}</p>
          <TrackMetadataEditor
            track={track}
            variant="panel"
            onSaved={onClose}
            onDeleted={canDelete ? onClose : undefined}
          />
        </div>
      </div>
    </div>
  );
}
