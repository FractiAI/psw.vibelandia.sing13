import {
  KeyboardEvent,
  memo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useRef,
  useState,
} from 'react';
import {
  clearComposerDraft,
  readComposerDraft,
  writeComposerDraft,
} from '@/lib/composerDraft';
import {
  attachmentsForWire,
  latticeAttachAccept,
  LATTICE_ATTACH_MAX_FILES,
  readLatticeFiles,
  revokeAttachmentPreviews,
  type LatticeAttachment,
} from '@/lib/attachments';
import { sendLatticeMessage } from '@/api';

export type ComposerDraftRowHandle = {
  focus: () => void;
  setDraftText: (text: string) => void;
  submit: () => Promise<void>;
};

type ComposerDraftRowProps = {
  signedIn: boolean;
  hasEdgeKey: boolean;
  creatorAttach: boolean;
  showWorking: boolean;
  activeThreadId: string | null;
  sending: boolean;
  sendPhase: string;
  pendingPrompt?: string | null;
  agentSeedPrompt?: string | null;
  onAgentSeedConsumed?: () => void;
  onBeforeSend?: () => void;
};

/**
 * Owns draft + attachments + textarea so keystrokes never re-render ComposerOptions
 * or the rest of ComposerBar.
 */
export const ComposerDraftRow = memo(
  forwardRef<ComposerDraftRowHandle, ComposerDraftRowProps>(function ComposerDraftRow(
    {
      signedIn,
      hasEdgeKey,
      creatorAttach,
      showWorking,
      activeThreadId,
      sending,
      sendPhase,
      pendingPrompt,
      agentSeedPrompt,
      onAgentSeedConsumed,
      onBeforeSend,
    },
    ref,
  ) {
    const [draft, setDraft] = useState(() => readComposerDraft(null));
    const [attachments, setAttachments] = useState<LatticeAttachment[]>([]);
    const [attachHint, setAttachHint] = useState<string | null>(null);
    const draftThreadRef = useRef<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const persistTimerRef = useRef<number | null>(null);
    const draftRef = useRef(draft);
    draftRef.current = draft;
    const attachmentsRef = useRef(attachments);
    attachmentsRef.current = attachments;
    const submitRef = useRef<() => Promise<void>>(async () => {});

    submitRef.current = async () => {
      if (!signedIn) return;
      const text = draftRef.current;
      const files = attachmentsRef.current;
      if (!text.trim() && !files.length) return;
      onBeforeSend?.();
      setDraft('');
      clearComposerDraft(activeThreadId);
      revokeAttachmentPreviews(files);
      setAttachments([]);
      setAttachHint(null);
      await sendLatticeMessage(text, attachmentsForWire(files));
      inputRef.current?.focus();
    };

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      setDraftText: (text: string) => {
        setDraft(text);
        writeComposerDraft(activeThreadId, text);
      },
      submit: () => submitRef.current(),
    }));

    useEffect(() => {
      const tid = activeThreadId;
      if (draftThreadRef.current === tid) return;
      if (draftThreadRef.current) {
        writeComposerDraft(draftThreadRef.current, draftRef.current);
      }
      draftThreadRef.current = tid;
      setDraft(readComposerDraft(tid));
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
      }, 400);
    }

    useEffect(() => {
      return () => {
        if (persistTimerRef.current != null) {
          window.clearTimeout(persistTimerRef.current);
          writeComposerDraft(draftThreadRef.current, draftRef.current);
        }
      };
    }, []);

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
        void submitRef.current();
      }
    }

    const canSend =
      signedIn &&
      hasEdgeKey &&
      (draft.trim().length > 0 || attachments.length > 0) &&
      !(sending && sendPhase !== 'stuck' && draft.trim() !== pendingPrompt);

    const inputBusy = !signedIn || !hasEdgeKey || (sending && sendPhase !== 'stuck');

    return (
      <>
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
            disabled={inputBusy}
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
            disabled={inputBusy}
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
            disabled={inputBusy}
          />
        </div>
        <button type="submit" disabled={!canSend}>
          {showWorking && draft.trim() === pendingPrompt ? 'Retry' : 'Send'}
        </button>
      </>
    );
  }),
);
