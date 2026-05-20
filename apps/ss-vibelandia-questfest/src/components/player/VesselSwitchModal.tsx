interface VesselSwitchModalProps {
  open: boolean;
  kind: 'vessel_switch' | 'tab_preempt' | null;
  onAck: () => void;
}

export function VesselSwitchModal({ open, kind, onAck }: VesselSwitchModalProps) {
  if (!open || !kind) return null;
  const isTab = kind === 'tab_preempt';
  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" />
      <div className="voxel-panel modal-card">
        <h2 className="modal-title">{isTab ? "Capitan's Bridge handoff" : 'Vessel Switch Detected'}</h2>
        <p className="modal-body">
          {isTab
            ? "Another Capitan's Bridge tab took stream priority. Frequency stays single-threaded — no split signal."
            : 'Playback moved to another device on your Pass. The stream lock cleared this deck.'}
        </p>
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--cyan" onClick={onAck}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
