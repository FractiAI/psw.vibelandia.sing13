import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCatalogStore } from '@/stores/catalogStore';
import { useSessionStore } from '@/stores/sessionStore';
import {
  BOOKING_EMAIL,
  CATALOG_EMAIL,
  EGS_EXPORT_USD,
  EGS_EXPORT_PLAYLIST_BUNDLE_PER_TRACK_USD,
  PAYMENT_HANDLES,
  RAIL_LABEL,
  type LiveRail,
} from '@/lib/paymentRails';
import { requestExport } from '@/lib/api';
import { downloadTrackToDevice } from '@/lib/downloadTrack';
import { hasExportLicense, saveExportLicense } from '@/lib/exportLicenses';
import { readPassToken } from '@/lib/mockJwt';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step =
  | 'idle'
  | 'need_access'
  | 'confirm'
  | 'rail'
  | 'pay'
  | 'honor'
  | 'working'
  | 'done'
  | 'error';

interface PlaylistBulkExportModalProps {
  open: boolean;
  onClose: () => void;
  onNeedPass: () => void;
  onCaptainRequest: () => void;
}

export function PlaylistBulkExportModal({
  open,
  onClose,
  onNeedPass,
  onCaptainRequest,
}: PlaylistBulkExportModalProps) {
  const getActivePlaylist = useCatalogStore((s) => s.getActivePlaylist);
  const getTrack = useCatalogStore((s) => s.getTrack);
  const isPassenger = useSessionStore((s) => s.isPassenger);
  const captainUnlocked = useSessionStore((s) => s.captainUnlocked);

  const [step, setStep] = useState<Step>('idle');
  const [rail, setRail] = useState<LiveRail | null>(null);
  const [paidDate, setPaidDate] = useState(todayISO);
  const [email, setEmail] = useState('');
  const [honorAck, setHonorAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const pl = getActivePlaylist();
  const targets = useMemo(() => {
    if (!pl) return [];
    return pl.trackIds
      .map((id) => {
        const track = getTrack(id);
        return track ? { id, track } : null;
      })
      .filter((x): x is { id: string; track: NonNullable<ReturnType<typeof getTrack>> } => !!x);
  }, [pl, getTrack]);

  const toLicense = useMemo(() => targets.filter((t) => !hasExportLicense(t.id)), [targets]);

  const totalUsd = useMemo(
    () => toLicense.length * EGS_EXPORT_PLAYLIST_BUNDLE_PER_TRACK_USD,
    [toLicense.length],
  );

  const reset = useCallback(() => {
    setStep('idle');
    setRail(null);
    setPaidDate(todayISO());
    setEmail('');
    setHonorAck(false);
    setBusy(false);
    setProgress({ done: 0, total: 0 });
    setError(null);
    setDoneMsg(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    setError(null);
    setDoneMsg(null);
    if (!pl || targets.length === 0) {
      setStep('error');
      setError('No tracks in this playlist.');
      return;
    }
    if (toLicense.length === 0) {
      setStep('done');
      setDoneMsg('Every track in this playlist is already licensed on this device.');
      return;
    }
    if (!isPassenger && !captainUnlocked) {
      setStep('need_access');
      return;
    }
    setStep('confirm');
  }, [open, pl, targets.length, toLicense.length, isPassenger, captainUnlocked, reset]);

  const runCaptainDownloads = async () => {
    setBusy(true);
    setError(null);
    setProgress({ done: 0, total: toLicense.length });
    const failures: string[] = [];
    for (let i = 0; i < toLicense.length; i++) {
      const { track } = toLicense[i];
      try {
        saveExportLicense({
          trackId: track.id,
          licensedAt: new Date().toISOString(),
          licenseId: 'captain-bulk',
        });
        await downloadTrackToDevice(track);
        setProgress({ done: i + 1, total: toLicense.length });
        await new Promise((r) => window.setTimeout(r, 350));
      } catch {
        failures.push(track.title);
      }
    }
    setBusy(false);
    if (failures.length) {
      setStep('error');
      setError(`Some files could not save: ${failures.join(', ')}`);
    } else {
      setStep('done');
      setDoneMsg(`Licensed and saved ${toLicense.length} track(s) with captain access.`);
    }
  };

  const runPassengerDownloads = async () => {
    if (!rail) return;
    const passToken = readPassToken();
    if (!passToken) {
      setError('Monthly pass required.');
      return;
    }
    setBusy(true);
    setError(null);
    setProgress({ done: 0, total: toLicense.length });
    const failures: string[] = [];
    for (let i = 0; i < toLicense.length; i++) {
      const { track } = toLicense[i];
      try {
        if (import.meta.env.DEV && email.trim() === 'dev@local') {
          saveExportLicense({
            trackId: track.id,
            licensedAt: new Date().toISOString(),
            licenseId: 'dev-local-bulk',
          });
        } else {
          const res = await requestExport({
            passToken,
            rail,
            honorConfirm: true,
            paidDate,
            email: email.trim(),
            trackId: track.id,
            trackTitle: track.title,
          });
          saveExportLicense({
            trackId: track.id,
            licensedAt: new Date().toISOString(),
            licenseId: res.licenseId,
            passengerJti: res.passengerJti,
          });
        }
        await downloadTrackToDevice(track);
        setProgress({ done: i + 1, total: toLicense.length });
        await new Promise((r) => window.setTimeout(r, 400));
      } catch (e) {
        failures.push(`${track.title} (${e instanceof Error ? e.message : 'failed'})`);
      }
    }
    setBusy(false);
    if (failures.length) {
      setStep('error');
      setError(failures.join(' · '));
    } else {
      setStep('done');
      setDoneMsg(`Unlocked and saved ${toLicense.length} track(s).`);
    }
  };

  if (!open) return null;

  const close = () => {
    reset();
    onClose();
  };

  const firstTitle = toLicense[0]?.track.title ?? 'tracks';

  return (
    <div className="modal-root" role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={() => !busy && close()} />
      <div className="voxel-panel modal-card modal-card--wide">
        <h2 className="modal-title">Download whole playlist</h2>
        <p className="modal-body">
          Playlist <strong>{pl?.name ?? '—'}</strong> — downloading the <strong>entire playlist at once</strong> uses the
          bundle rate <strong>${EGS_EXPORT_PLAYLIST_BUNDLE_PER_TRACK_USD.toFixed(2)}</strong> per track (50% off the
          single-track <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> Fair Exchange). Captain access still bypasses
          payment on this device.
        </p>

        {step === 'need_access' && (
          <>
            <p className="modal-body">
              You need an <strong>active monthly pass</strong> or <strong>captain access</strong> before bulk downloads.
            </p>
            <div className="modal-actions">
              <button type="button" className="voxel-btn voxel-btn--orange" onClick={() => { close(); onNeedPass(); }}>
                Get monthly pass
              </button>
              <button type="button" className="voxel-btn" onClick={() => { close(); onCaptainRequest(); }}>
                I am the captain — password
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" onClick={close}>
                Cancel
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <p className="modal-body">
              You are about to purchase downloads for <strong>{toLicense.length}</strong>{' '}
              {toLicense.length === 1 ? 'track' : 'tracks'} totaling{' '}
              <strong>${totalUsd.toFixed(2)}</strong>
              {captainUnlocked ? (
                <>
                  {' '}
                  — playlist bundle rate (50% off per track vs single <strong>${EGS_EXPORT_USD.toFixed(2)}</strong>).
                  Captain mode <strong>bypasses payment</strong> on this device after you confirm.
                </>
              ) : (
                <>
                  {' '}
                  (playlist bundle: <strong>{toLicense.length}</strong> ×{' '}
                  <strong>${EGS_EXPORT_PLAYLIST_BUNDLE_PER_TRACK_USD.toFixed(2)}</strong> — 50% off full-playlist
                  downloads vs <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> each à la carte.)
                </>
              )}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="voxel-btn voxel-btn--orange"
                disabled={busy}
                onClick={() => {
                  if (captainUnlocked) {
                    setStep('working');
                    void runCaptainDownloads();
                  } else {
                    setStep('rail');
                  }
                }}
              >
                Confirm to proceed
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" disabled={busy} onClick={close}>
                Cancel
              </button>
            </div>
          </>
        )}

        {step === 'rail' && (
          <>
            <p className="modal-body">
              One payment can cover this batch: send <strong>${totalUsd.toFixed(2)}</strong> total for{' '}
              {toLicense.length} track(s) at the <strong>50% playlist-bundle</strong> rate, then confirm on the honor
              screen (same details apply to each license we record).
            </p>
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
            <button type="button" className="voxel-btn voxel-btn--ghost" onClick={() => setStep('confirm')}>
              Back
            </button>
          </>
        )}

        {step === 'pay' && rail && (
          <>
            <p className="modal-body">
              Send <strong>${totalUsd.toFixed(2)}</strong> on {RAIL_LABEL[rail]} to{' '}
              <code>{PAYMENT_HANDLES[rail]}</code> (bundle total — half the à la carte total). For the memo, start with{' '}
              <code>BULK EXPORT · {toLicense.length} tracks · 50pct bundle</code> — then add your note.
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
              Confirm you sent <strong>${totalUsd.toFixed(2)}</strong> on <strong>{RAIL_LABEL[rail]}</strong> for this
              bundle. We record the date, your email, and payment app for each track license.
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
                I confirm I completed payment of <strong>${totalUsd.toFixed(2)}</strong> using{' '}
                <strong>{RAIL_LABEL[rail]}</strong> for this playlist download.
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
                onClick={() => {
                  setStep('working');
                  void runPassengerDownloads();
                }}
              >
                {busy ? 'Working…' : 'Unlock all & download'}
              </button>
              <button type="button" className="voxel-btn voxel-btn--ghost" onClick={() => setStep('pay')} disabled={busy}>
                Back
              </button>
            </div>
            <a
              className="voxel-btn"
              href={`mailto:${CATALOG_EMAIL}?subject=${encodeURIComponent(`BULK EXPORT ${toLicense.length} tracks · 50% bundle`)}&body=${encodeURIComponent(`Bundle total (50% playlist discount): $${totalUsd.toFixed(2)}\nHonor confirmation or paste txn proof:\n\n`)}`}
            >
              Email proof instead
            </a>
            {error && <p className="modal-error">{error}</p>}
          </>
        )}

        {step === 'working' && (
          <>
            <p className="modal-body">
              {busy ? `Saving files… ${progress.done}/${progress.total}` : 'Starting…'}
            </p>
            {error && <p className="modal-error">{error}</p>}
          </>
        )}

        {(step === 'done' || step === 'error') && (
          <>
            {doneMsg && <p className="modal-body">{doneMsg}</p>}
            {error && step === 'error' && <p className="modal-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="voxel-btn voxel-btn--orange" onClick={close}>
                Close
              </button>
            </div>
          </>
        )}

        <p className="modal-fine">
          Questions: {BOOKING_EMAIL} · playlist bundle <strong>${EGS_EXPORT_PLAYLIST_BUNDLE_PER_TRACK_USD.toFixed(2)}</strong>
          /track (50% off) · single-track <strong>${EGS_EXPORT_USD.toFixed(2)}</strong> · first unpaid track “{firstTitle}”
        </p>
      </div>
    </div>
  );
}
