import { useState } from 'react';
import { useSessionStore } from '@/stores/sessionStore';

interface CaptainUnlockModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful unlock (modal still open until onClose). */
  onUnlocked?: () => void;
}

export function CaptainUnlockModal({ open, onClose, onUnlocked }: CaptainUnlockModalProps) {
  const tryCaptainPassword = useSessionStore((s) => s.tryCaptainPassword);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  const close = () => {
    setPw('');
    setErr(null);
    onClose();
  };

  const submit = () => {
    setErr(null);
    if (!tryCaptainPassword(pw)) {
      setErr('That password does not match. Try again or use the regular payment flow.');
      return;
    }
    setPw('');
    onUnlocked?.();
    onClose();
  };

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="cap-title">
      <div className="modal-backdrop" onClick={close} />
      <div className="voxel-panel modal-card modal-card--wide">
        <h2 id="cap-title" className="modal-title">
          Captain / operator access
        </h2>
        <p className="modal-body">
          If you run this deck, confirm below. This unlocks <strong>full playback</strong> and{' '}
          <strong>per-track downloads without the payment rails</strong> on this browser session only.
        </p>
        <label className="boarding-field">
          <span>Captain password</span>
          <input
            className="libretto-input boarding-input"
            type="password"
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="Enter operator password"
          />
        </label>
        {err && <p className="modal-error">{err}</p>}
        <div className="modal-actions">
          <button type="button" className="voxel-btn voxel-btn--orange" onClick={submit}>
            Unlock
          </button>
          <button type="button" className="voxel-btn voxel-btn--ghost" onClick={close}>
            Cancel
          </button>
        </div>
        <p className="modal-fine">
          Session-only unlock. To clear captain access and your stored monthly pass, open this monthly pass window (from
          the player bar or after preview ends) and use{' '}
          <strong>{isPassenger ? 'Sign out · clear pass & captain' : 'Clear captain unlock'}</strong> at the bottom.
        </p>
      </div>
    </div>
  );
}
