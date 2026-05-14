import { useEffect, useState } from 'react';
import {
  BOOKING_EMAIL,
  CATALOG_EMAIL,
  EGS_EXPORT_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  exportNote,
  type LiveRail,
} from '@/lib/paymentRails';
import type { TrackDef } from '@/lib/catalogTypes';
import { requestExport } from '@/lib/api';
import { downloadTrackToDevice } from '@/lib/downloadTrack';
import { hasExportLicense, saveExportLicense } from '@/lib/exportLicenses';
import { readPassToken } from '@/lib/mockJwt';

interface ExportTrackModalProps {
  open: boolean;
  track: TrackDef | undefined;
  isPassenger: boolean;
  onClose: () => void;
  onNeedPass: () => void;
}

export function ExportTrackModal({
  open,
  track,
  isPassenger,
  onClose,
  onNeedPass,
}: ExportTrackModalProps) {
  const [step, setStep] = useState<'gate' | 'rail' | 'pay' | 'proof' | 'done'>('gate');
  const [rail, setRail] = useState<LiveRail | null>(null);
  const [receipt, setReceipt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const licensed = track ? hasExportLicense(track.id) : false;

  useEffect(() => {
    if (!open || !track) return;
    setStep(licensed ? 'done' : isPassenger ? 'rail' : 'gate');
    setRail(null);
    setReceipt('');
    setBusy(false);
    setError(null);
    setMsg(null);
  }, [open, track?.id, isPassenger, licensed]);

  if (!open || !track) return null;

  const title = track.title;

  const close = () => {
    onClose();
  };

  const runDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      await downloadTrackToDevice(track);
      setMsg(`Saved “${title}” to your device. Use any player offline.`);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'download_failed');
    } finally {
      setBusy(false);
    }
  };

  const submitProof = async () => {
    if (!rail) return;
    setBusy(true);
    setError(null);
    try {
      const passToken = readPassToken();
      if (!passToken) throw new Error('monthly_pass_required');

      if (import.meta.env.DEV && receipt === 'dev-local-export') {
        saveExportLicense({
          trackId: track.id,
          licensedAt: new Date().toISOString(),
          licenseId: 'dev-local',
        });
      } else {
        const res = await requestExport({
          passToken,
          rail,
          receipt,
          trackId: track.id,
          trackTitle: title,
        });
        saveExportLicense({
          trackId: track.id,
          licensedAt: new Date().toISOString(),
          licenseId: res.licenseId,
          passengerJti: res.passengerJti,
        });
      }
      await runDownload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'export_failed');
    } finally {
      setBusy(false);
    }
  };

  const subject = encodeURIComponent(`EXPORT ${track.id} · ${title}`);
  const body = encodeURIComponent(
    `Track: ${title} (${track.id})\nEGS export: $${EGS_EXPORT_USD.toFixed(2)}\nPaste txn id / @handle proof below:\n\n`,
  );

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={close} />
      <div className="voxel-panel modal-card modal-card--wide">
        <h2 className="modal-title">Download to device · ${EGS_EXPORT_USD.toFixed(2)}</h2>
        <p className="modal-body">
          <strong>{title}</strong> — save the file for offline listening in any player. Monthly pass
          holders only; each download is <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> Fair Exchange.
        </p>

        {step === 'gate' && (
          <>
            <p className="modal-body">
              You need an <strong>active monthly pass</strong> before you can buy a track download.
              Streaming stays on the pass; downloads are per track.
            </p>
            <div className="modal-actions">
              <button type="button" className="voxel-btn voxel-btn--orange" onClick={onNeedPass}>
                Get monthly pass
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" onClick={close}>
                Back
              </button>
            </div>
          </>
        )}

        {step === 'rail' && (
          <>
            <p className="modal-body">Pick how you pay ${EGS_EXPORT_USD.toFixed(2)} for this download.</p>
            <div className="rail-grid">
              {(Object.keys(PAYMENT_HANDLES) as LiveRail[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className="voxel-btn"
                  onClick={() => {
                    setRail(r);
                    setStep('pay');
                  }}
                >
                  {RAIL_LABEL[r]}
                </button>
              ))}
            </div>
            <button type="button" className="voxel-btn voxel-btn--ghost" onClick={close}>
              Cancel
            </button>
          </>
        )}

        {step === 'pay' && rail && (
          <>
            <p className="modal-body">
              Send <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> on {RAIL_LABEL[rail]} to{' '}
              <code>{PAYMENT_HANDLES[rail]}</code>. Payment note: <code>{exportNote(title)}</code>
            </p>
            <button type="button" className="voxel-btn voxel-btn--orange" onClick={() => setStep('proof')}>
              I paid — enter proof
            </button>
            <button type="button" className="voxel-btn voxel-btn--ghost" onClick={() => setStep('rail')}>
              Back
            </button>
          </>
        )}

        {step === 'proof' && rail && (
          <>
            <label className="boarding-field">
              Receipt / txn id / @handle
              <input
                className="libretto-input boarding-input"
                value={receipt}
                onChange={(e) => setReceipt(e.target.value)}
                placeholder="Paste proof from Venmo, PayPal, or Cash App"
              />
            </label>
            {import.meta.env.DEV && (
              <p className="modal-fine">
                Dev: use receipt <code>dev-local-export</code> with an active pass.
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={busy || receipt.trim().length < 3}
                onClick={submitProof}
              >
                {busy ? 'Unlocking…' : 'Unlock & download'}
              </button>
              <a
                className="voxel-btn"
                href={`mailto:${CATALOG_EMAIL}?subject=${subject}&body=${body}`}
              >
                Email proof instead
              </a>
            </div>
            {error && <p className="modal-error">{error}</p>}
          </>
        )}

        {step === 'done' && (
          <>
            {licensed && !msg && (
              <p className="modal-body">You already own this download on this device.</p>
            )}
            {msg && <p className="modal-body">{msg}</p>}
            <div className="modal-actions">
              <button type="button" className="voxel-btn voxel-btn--orange" disabled={busy} onClick={runDownload}>
                {busy ? 'Saving…' : 'Download again'}
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" onClick={close}>
                Done
              </button>
            </div>
            {error && <p className="modal-error">{error}</p>}
          </>
        )}

        <p className="modal-fine">
          Pass = stream the catalog. Download = ${EGS_EXPORT_USD.toFixed(2)} per file for your library.
          Questions: {BOOKING_EMAIL}
        </p>
      </div>
    </div>
  );
}
