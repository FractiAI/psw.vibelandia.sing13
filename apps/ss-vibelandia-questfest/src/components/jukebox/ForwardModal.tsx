import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ForwardTarget } from '@/lib/shareCatalog';
import {
  buildForwardUrl,
  copyForwardMessage,
  nativeForwardShare,
  openForwardEmail,
  openForwardSms,
} from '@/lib/shareCatalog';
import type { ForwardRecipient } from '@/lib/forwardRecipients';
import {
  createForwardRecipient,
  loadForwardRecipients,
  removeForwardRecipient,
  saveForwardRecipients,
  upsertForwardRecipient,
} from '@/lib/forwardRecipients';
import { PLAIN } from '@/lib/plainSpeak';

export type ForwardModalProps = {
  open: boolean;
  target: ForwardTarget | null;
  onClose: () => void;
};

export function ForwardModal({ open, target, onClose }: ForwardModalProps) {
  const [recipients, setRecipients] = useState<ForwardRecipient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRecipients(loadForwardRecipients());
    setSelected(new Set());
    setName('');
    setEmail('');
    setPhone('');
    setNote(null);
    setBusy(false);
  }, [open, target]);

  const selectedList = useMemo(
    () => recipients.filter((r) => selected.has(r.id)),
    [recipients, selected],
  );

  const headline = useMemo(() => {
    if (!target) return '';
    return target.kind === 'track' ? target.track.title : target.playlist.name;
  }, [target]);

  const url = useMemo(() => (target ? buildForwardUrl(target) : ''), [target]);

  const persist = useCallback((next: ForwardRecipient[]) => {
    setRecipients(next);
    saveForwardRecipients(next);
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAdd = useCallback(() => {
    const rec = createForwardRecipient({ name, email, phone });
    if (!rec) {
      setNote(PLAIN.forwardNeedContact);
      return;
    }
    const next = upsertForwardRecipient(recipients, rec);
    persist(next);
    setSelected((prev) => new Set(prev).add(rec.id));
    setName('');
    setEmail('');
    setPhone('');
    setNote(PLAIN.forwardSaved);
  }, [email, name, phone, persist, recipients]);

  const handleRemove = useCallback(
    (id: string) => {
      persist(removeForwardRecipient(recipients, id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [persist, recipients],
  );

  const flash = useCallback((msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(null), 3500);
  }, []);

  const handleEmail = useCallback(() => {
    if (!target) return;
    if (!selectedList.length) {
      flash(PLAIN.forwardPickRecipients);
      return;
    }
    const result = openForwardEmail(target, selectedList);
    if (result === 'noop') flash(PLAIN.forwardNeedEmail);
    else flash(PLAIN.forwardOpenedMail);
  }, [flash, selectedList, target]);

  const handleSms = useCallback(() => {
    if (!target) return;
    if (!selectedList.length) {
      flash(PLAIN.forwardPickRecipients);
      return;
    }
    const result = openForwardSms(target, selectedList);
    if (result === 'noop') flash(PLAIN.forwardNeedPhone);
    else flash(PLAIN.forwardOpenedSms);
  }, [flash, selectedList, target]);

  const handleCopy = useCallback(async () => {
    if (!target) return;
    setBusy(true);
    const result = await copyForwardMessage(target);
    setBusy(false);
    flash(result === 'copied' ? PLAIN.forwardCopied : PLAIN.shareFailed);
  }, [flash, target]);

  const handleNative = useCallback(async () => {
    if (!target) return;
    setBusy(true);
    const result = await nativeForwardShare(target);
    setBusy(false);
    if (result === 'copied') flash(PLAIN.forwardCopied);
    else if (result === 'failed') flash(PLAIN.shareFailed);
  }, [flash, target]);

  if (!open || !target) return null;

  const kindLabel = target.kind === 'track' ? PLAIN.forwardTrack : PLAIN.forwardPlaylist;

  return (
    <div
      className="jb-pl-picker-backdrop jb-forward-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="jb-forward-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jb-forward-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="jb-forward-head">
          <div>
            <h2 id="jb-forward-title">{kindLabel}</h2>
            <p className="jb-forward-sub">{headline}</p>
          </div>
          <button type="button" className="jb-pl-picker__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="jb-forward-hint">{PLAIN.forwardHint}</p>
        <p className="jb-forward-url" title={url}>
          {url}
        </p>

        <section className="jb-forward-book" aria-label={PLAIN.forwardRecipients}>
          {recipients.length === 0 ? (
            <p className="jb-forward-empty">{PLAIN.forwardEmpty}</p>
          ) : (
            <ul className="jb-forward-list">
              {recipients.map((r) => {
                const checked = selected.has(r.id);
                const detail = [r.email, r.phone].filter(Boolean).join(' · ');
                return (
                  <li key={r.id} className={`jb-forward-row${checked ? ' jb-forward-row--on' : ''}`}>
                    <label className="jb-forward-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(r.id)}
                      />
                      <span>
                        <strong>{r.name}</strong>
                        {detail ? <span className="jb-forward-detail">{detail}</span> : null}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="jb-tool-btn jb-tool-btn--danger"
                      aria-label={`Remove ${r.name}`}
                      onClick={() => handleRemove(r.id)}
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <form
          className="jb-forward-add"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <p className="jb-forward-add-label">{PLAIN.forwardAdd}</p>
          <input
            className="jb-forward-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={PLAIN.forwardName}
            aria-label={PLAIN.forwardName}
            autoComplete="name"
          />
          <input
            className="jb-forward-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={PLAIN.forwardEmail}
            aria-label={PLAIN.forwardEmail}
            autoComplete="email"
          />
          <input
            className="jb-forward-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={PLAIN.forwardPhone}
            aria-label={PLAIN.forwardPhone}
            autoComplete="tel"
          />
          <button type="submit" className="jb-tool-btn jb-tool-btn--gold">
            {PLAIN.forwardSaveContact}
          </button>
        </form>

        {note ? (
          <p className="jb-forward-note" role="status">
            {note}
          </p>
        ) : null}

        <div className="jb-forward-actions">
          <button
            type="button"
            className="jb-tool-btn jb-tool-btn--gold"
            disabled={busy}
            onClick={handleEmail}
          >
            {PLAIN.forwardEmailSend}
          </button>
          <button type="button" className="jb-tool-btn" disabled={busy} onClick={handleSms}>
            {PLAIN.forwardTextSend}
          </button>
          <button type="button" className="jb-tool-btn" disabled={busy} onClick={() => void handleCopy()}>
            {PLAIN.forwardCopy}
          </button>
          <button type="button" className="jb-tool-btn" disabled={busy} onClick={() => void handleNative()}>
            {PLAIN.forwardNative}
          </button>
        </div>

        <footer className="jb-forward-foot">
          <button type="button" className="jb-link-btn" onClick={onClose}>
            {PLAIN.cancel}
          </button>
          {selectedList.length > 0 ? (
            <span className="jb-forward-count">
              {selectedList.length} {PLAIN.forwardSelected}
            </span>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
