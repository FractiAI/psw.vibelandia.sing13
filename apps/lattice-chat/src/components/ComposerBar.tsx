import {
  FormEvent,
  KeyboardEvent,
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
import { sendLatticeMessage } from '@/api';
import {
  clearComposerDraft,
  readComposerDraft,
  writeComposerDraft,
} from '@/lib/composerDraft';
import { ComposerOptions } from '@/components/ComposerOptions';
import {
  attachmentsForWire,
  latticeAttachAccept,
  LATTICE_ATTACH_MAX_FILES,
  readLatticeFiles,
  revokeAttachmentPreviews,
  type LatticeAttachment,
} from '@/lib/attachments';
import { useLatticeStore } from '@/store';
import type { LatticeProvider } from '@/lib/providerKeys';
import type { AgentMode, NestTopology } from '@/types';

type ComposerBarProps = {
  signedIn: boolean;
  hasEdgeKey: boolean;
  creatorAttach: boolean;
  showWorking: boolean;
  agentSeedPrompt?: string | null;
  onAgentSeedConsumed?: () => void;
  /** Called before send so parent can stick scroll to bottom. */
  onBeforeSend?: () => void;
};

/**
 * Owns draft + attachments so keystrokes do not re-render the message list.
 */
export const ComposerBar = memo(function ComposerBar({
  signedIn,
  hasEdgeKey,
  creatorAttach,
  showWorking,
  agentSeedPrompt,
  onAgentSeedConsumed,
  onBeforeSend,
}: ComposerBarProps) {
  const activeThreadId = useLatticeStore((s) => s.activeThreadId);
  const sending = useLatticeStore((s) => s.sending);
  const sendPhase = useLatticeStore((s) => s.sendPhase);
  const pending = useLatticeStore((s) => s.pending);
  const provider = useLatticeStore((s) => s.provider);
  const agentMode = useLatticeStore((s) => s.agentMode);
  const nestTopology = useLatticeStore((s) => s.nestTopology);
  const agentRoster = useLatticeStore((s) => s.agentRoster);
  const modelId = useLatticeStore((s) => s.modelId);
  const models = useLatticeStore((s) => s.models);
  const setProvider = useLatticeStore((s) => s.setProvider);
  const setAgentMode = useLatticeStore((s) => s.setAgentMode);
  const setNestTopology = useLatticeStore((s) => s.setNestTopology);
  const setAgentRoster = useLatticeStore((s) => s.setAgentRoster);
  const setModelId = useLatticeStore((s) => s.setModelId);

  const [draft, setDraft] = useState(() => readComposerDraft(null));
  const [attachments, setAttachments] = useState<LatticeAttachment[]>([]);
  const [attachHint, setAttachHint] = useState<string | null>(null);
  const draftThreadRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const persistTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const tid = activeThreadId;
    if (draftThreadRef.current === tid) return;
    if (draftThreadRef.current) {
      writeComposerDraft(draftThreadRef.current, draft);
    }
    draftThreadRef.current = tid;
    setDraft(readComposerDraft(tid));
    // Intentionally omit `draft` — only swap when the active thread changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  useEffect(() => {
    if (!agentSeedPrompt) return;
    setDraft(agentSeedPrompt);
    writeComposerDraft(activeThreadId, agentSeedPrompt);
    onAgentSeedConsumed?.();
    inputRef.current?.focus();
  }, [agentSeedPrompt, onAgentSeedConsumed, activeThreadId]);

  function scheduleDraftPersist(tid: string | null, value: string) {
    if (persistTimerRef.current != null) {
      window.clearTimeout(persistTimerRef.current);
    }
    persistTimerRef.current = window.setTimeout(() => {
      writeComposerDraft(tid, value);
      persistTimerRef.current = null;
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (persistTimerRef.current != null) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!signedIn) return;
    if (!draft.trim() && !attachments.length) return;
    onBeforeSend?.();
    const text = draft;
    const wire = attachmentsForWire(attachments);
    setDraft('');
    clearComposerDraft(activeThreadId);
    revokeAttachmentPreviews(attachments);
    setAttachments([]);
    setAttachHint(null);
    await sendLatticeMessage(text, wire);
    inputRef.current?.focus();
  }

  async function onPickFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    if (!creatorAttach) {
      const room = LATTICE_ATTACH_MAX_FILES - attachments.length;
      if (room <= 0) {
        setAttachHint(`Max ${LATTICE_ATTACH_MAX_FILES} files per send.`);
        return;
      }
      const { attachments: next, errors } = await readLatticeFiles(
        Array.from(fileList).slice(0, room),
      );
      if (errors.length) setAttachHint(errors.join(' · '));
      else setAttachHint(null);
      setAttachments((prev) => [...prev, ...next].slice(0, LATTICE_ATTACH_MAX_FILES));
    } else {
      const { attachments: next, errors } = await readLatticeFiles(Array.from(fileList), {
        unlimited: true,
      });
      if (errors.length) setAttachHint(errors.join(' · '));
      else setAttachHint(null);
      setAttachments((prev) => [...prev, ...next]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void onSubmit(e);
    }
  }

  const canSend =
    signedIn &&
    hasEdgeKey &&
    (draft.trim().length > 0 || attachments.length > 0) &&
    !(sending && sendPhase !== 'stuck' && draft.trim() !== pending?.prompt);

  return (
    <form className={`composer${signedIn && hasEdgeKey ? '' : ' composer--boarding'}`} onSubmit={onSubmit}>
      {signedIn && hasEdgeKey ? (
        <ComposerOptions
          provider={provider as LatticeProvider}
          mode={agentMode as AgentMode}
          nestTopology={nestTopology as NestTopology}
          agentRoster={agentRoster}
          modelId={modelId}
          models={models}
          disabled={sending}
          onProviderChange={setProvider}
          onModeChange={setAgentMode}
          onNestChange={setNestTopology}
          onRosterChange={setAgentRoster}
          onModelChange={setModelId}
        />
      ) : null}
      {signedIn && hasEdgeKey && attachments.length ? (
        <ul className="composer-attach-chips" aria-label="Attached files">
          {attachments.map((a, i) => (
            <li key={`${a.name}-${i}`} className="composer-attach-chip">
              {a.previewUrl ? (
                <img src={a.previewUrl} alt="" className="composer-attach-thumb" />
              ) : (
                <span className="composer-attach-doc" aria-hidden>
                  📄
                </span>
              )}
              <span className="composer-attach-name">{a.name}</span>
              <button
                type="button"
                className="composer-attach-remove"
                aria-label={`Remove ${a.name}`}
                disabled={sending && sendPhase !== 'stuck'}
                onClick={() => removeAttachment(i)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {attachHint ? (
        <p className="composer-attach-hint" role="status">
          {attachHint}
        </p>
      ) : null}
      <label className="sr-only" htmlFor="lattice-composer">
        Message
      </label>
      <div className="composer-input-row">
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          id="lattice-attach-input"
          accept={latticeAttachAccept()}
          multiple
          disabled={!signedIn || !hasEdgeKey || (sending && sendPhase !== 'stuck')}
          onChange={(e) => void onPickFiles(e.target.files)}
        />
        <button
          type="button"
          className="composer-attach-btn"
          title={
            creatorAttach
              ? 'Attach images, PDFs, or text docs (Player 1 — no Lattice attach caps)'
              : 'Attach images, PDFs, or text docs (Cursor and Claude can see images; PDFs as extracted text)'
          }
          aria-label="Attach images or documents"
          disabled={!signedIn || !hasEdgeKey || (sending && sendPhase !== 'stuck')}
          onClick={() => fileInputRef.current?.click()}
        >
          📎
        </button>
        <textarea
          id="lattice-composer"
          ref={inputRef}
          rows={3}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
            scheduleDraftPersist(activeThreadId, v);
          }}
          onKeyDown={onKeyDown}
          placeholder={
            showWorking
              ? 'Your Valet is working… use Check for reply instead of re-pasting'
              : !signedIn
                ? 'Welcome aboard — sign in above to chat…'
                : !hasEdgeKey
                  ? 'Bring your key to the bridge above…'
                  : 'Message your Goldilocks Valet…'
          }
          disabled={!signedIn || !hasEdgeKey || (sending && sendPhase !== 'stuck')}
        />
      </div>
      <button type="submit" disabled={!canSend}>
        {showWorking && draft.trim() === pending?.prompt ? 'Retry' : 'Send'}
      </button>
    </form>
  );
});
