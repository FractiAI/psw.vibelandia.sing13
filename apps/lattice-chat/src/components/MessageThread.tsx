import { KeyboardEvent, memo, useMemo, useState } from 'react';
import { AgentTranscript } from '@/components/AgentTranscript';
import { MarkdownBody } from '@/components/MarkdownBody';
import { TokenCompareFooter, hasMeasuredTokens } from '@/components/TokenCompare';
import { peerNameForId } from '@/feed/seatIdentity';
import type { ChatMessage } from '@/types';

/** Render window — full history stays in store; DOM only mounts the visible tail. */
export const MESSAGE_RENDER_WINDOW = 40;

type MessageThreadProps = {
  messages: ChatMessage[];
  myCollabPeerId: string | null;
  onJumpToCollabDm: (peerId: string) => void;
};

/**
 * Memoized message list — must not re-render on composer keystrokes.
 * Large threads only paint the latest window until the guest expands earlier turns.
 */
export const MessageThread = memo(function MessageThread({
  messages,
  myCollabPeerId,
  onJumpToCollabDm,
}: MessageThreadProps) {
  const [showAll, setShowAll] = useState(false);
  const hiddenCount = Math.max(0, messages.length - MESSAGE_RENDER_WINDOW);
  const visible = useMemo(() => {
    if (showAll || messages.length <= MESSAGE_RENDER_WINDOW) return messages;
    return messages.slice(messages.length - MESSAGE_RENDER_WINDOW);
  }, [messages, showAll]);

  return (
    <>
      {hiddenCount > 0 && !showAll ? (
        <button
          type="button"
          className="msg-load-earlier"
          onClick={() => setShowAll(true)}
        >
          Show {hiddenCount} earlier message{hiddenCount === 1 ? '' : 's'}
        </button>
      ) : null}
      {visible.map((m) => {
        const userLabel =
          m.role === 'user'
            ? m.senderPeerId && myCollabPeerId && m.senderPeerId !== myCollabPeerId
              ? m.senderName || peerNameForId(m.senderPeerId)
              : 'You'
            : null;
        const isRemoteSeat =
          m.role === 'user' &&
          Boolean(m.senderPeerId) &&
          Boolean(myCollabPeerId) &&
          m.senderPeerId !== myCollabPeerId;
        return (
          <article
            key={m.id}
            className={`bubble bubble-${m.role}${isRemoteSeat ? ' bubble--collab-jump' : ''}`}
            data-role={m.role}
            data-sender={m.senderPeerId || undefined}
            {...(isRemoteSeat
              ? {
                  role: 'link' as const,
                  tabIndex: 0,
                  title: `Open Collaborate chat with ${userLabel}`,
                  onClick: () => onJumpToCollabDm(m.senderPeerId!),
                  onKeyDown: (e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onJumpToCollabDm(m.senderPeerId!);
                    }
                  },
                }
              : {})}
          >
            <span className="bubble-role">
              {m.role === 'user'
                ? userLabel
                : m.mode || m.model
                  ? `Valet · ${m.mode || 'agent'}${m.model ? ` · ${m.model}` : ''}`
                  : 'Valet'}
            </span>
            {m.role === 'assistant' && m.transcript?.length ? (
              <AgentTranscript items={m.transcript} defaultOpen={false} />
            ) : m.role === 'assistant' ? (
              <div className="bubble-body">
                <MarkdownBody>{m.content}</MarkdownBody>
              </div>
            ) : (
              <div className="bubble-body">{m.content}</div>
            )}
            {m.role === 'assistant' && m.tokens && hasMeasuredTokens(m.tokens) ? (
              <TokenCompareFooter tokens={m.tokens} />
            ) : null}
          </article>
        );
      })}
    </>
  );
});
