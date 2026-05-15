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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ExportTrackModalProps {
  open: boolean;
  track: TrackDef | undefined;
  isPassenger: boolean;
  captainUnlocked: boolean;
  onClose: () => void;
  onNeedPass: () => void;
}

export function ExportTrackModal({
  open,
  track,
  isPassenger,
  captainUnlocked,
  onClose,
  onNeedPass,
}: ExportTrackModalProps) {
  const [step, setStep] = useState<'gate' | 'captain_bypass' | 'rail' | 'pay' | 'honor' | 'done'>('gate');
  const [rail, setRail] = useState<LiveRail | null>(null);
  const [paidDate, setPaidDate] = useState(todayISO);
  const [email, setEmail] = useState('');
  const [honorAck, setHonorAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const licensed = track ? hasExportLicense(track.id) : false;

  useEffect(() => {
    if (!open || !track) return;
    if (licensed) setStep('done');
    else if (captainUnlocked) setStep('captain_bypass');
    else if (isPassenger) setStep('rail');
    else setStep('gate');
    setRail(null);
    setPaidDate(todayISO());
    setEmail('');
    setHonorAck(false);
    setBusy(false);
    setError(null);
    setMsg(null);
  }, [open, track?.id, isPassenger, captainUnlocked, licensed]);

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

  const captainGrantAndDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      saveExportLicense({
        trackId: track.id,
        licensedAt: new Date().toISOString(),
        licenseId: 'captain-bypass',
      });
      await downloadTrackToDevice(track);
      setMsg(`Saved “${title}” to your device. Use any player offline.`);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'download_failed');
    } finally {
      setBusy(false);
    }
  };

  const submitHonor = async () => {
    if (!rail) return;
    setBusy(true);
    setError(null);
    try {
      const passToken = readPassToken();
      if (!passToken) throw new Error('monthly_pass_required');

      if (import.meta.env.DEV && email.trim() === 'dev@local') {
        saveExportLicense({
          trackId: track.id,
          licensedAt: new Date().toISOString(),
          licenseId: 'dev-local',
        });
      } else {
        const res = await requestExport({
          passToken,
          rail,
          honorConfirm: true,
          paidDate,
          email: email.trim(),
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
    `Track: ${title} (${track.id})\nEGS export: $${EGS_EXPORT_USD.toFixed(2)}\nHonor confirmation: date paid, email, and app used — or paste txn proof:\n\n`,
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
              You need an <strong>active monthly pass</strong> or <strong>captain access</strong> before you can buy a
              track download. Streaming stays on the pass; downloads are per track. Captain unlock lives inside{' '}
              <strong>Get monthly pass</strong> — expand <strong>Are you the captain?</strong> there, or use the Fair
              Exchange screen after a 30s preview (or the <strong>Captain</strong> link in the header).
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

        {step === 'captain_bypass' && (
          <>
            <p className="modal-body">
              Captain access is on for this browser session. You can save <strong>{title}</strong> without the Venmo /
              PayPal / Cash App honor flow on this device.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={busy}
                onClick={() => void captainGrantAndDownload()}
              >
                {busy ? 'Saving…' : 'Download now'}
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" onClick={close} disabled={busy}>
                Cancel
              </button>
            </div>
            {error && <p className="modal-error">{error}</p>}
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
            <button type="button" className="voxel-btn voxel-btn--orange" onClick={() => setStep('honor')}>
              I paid — confirm on honor
            </button>
            <button type="button" className="voxel-btn voxel-btn--ghost" onClick={() => setStep('rail')}>
              Back
            </button>
          </>
        )}

        {step === 'honor' && rail && (
          <>
            <p className="modal-body">
              Confirm you sent <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> on <strong>{RAIL_LABEL[rail]}</strong> for
              this download. We record the date, your email, and payment app — same honor system as the monthly pass.
            </p>
            <label className="boarding-field" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={honorAck}
                onChange={(e) => setHonorAck(e.target.checked)}
                disabled={busy}
                style={{ marginTop: '0.2rem' }}
              />
              <span>
                I confirm I completed payment of <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> using{' '}
                <strong>{RAIL_LABEL[rail]}</strong>.
              </span>
            </label>
            <label className="boarding-field">
              Date you paid
              <input
                className="libretto-input boarding-input"
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                disabled={busy}
              />
            </label>
            <label className="boarding-field">
              Email
              <input
                className="libretto-input boarding-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </label>
            {import.meta.env.DEV && (
              <p className="modal-fine">
                Dev: use email <code>dev@local</code> with an active pass to skip the export API.
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={
                  busy || !honorAck || !EMAIL_RE.test(email.trim()) || paidDate.length < 10
                }
                onClick={() => void submitHonor()}
              >
                {busy ? 'Unlocking…' : 'Unlock & download'}
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" onClick={() => setStep('pay')} disabled={busy}>
                Back
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
