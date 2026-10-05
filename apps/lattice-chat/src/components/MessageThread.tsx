import { KeyboardEvent, memo, useMemo, useState } from 'react';
import { AgentTranscript } from '@/components/AgentTranscript';
import { MarkdownBody } from '@/components/MarkdownBody';
import { TokenCompareFooter, hasMeasuredTokens } from '@/components/TokenCompare';
import { peerNameForId } from '@/feed/seatIdentity';
import {
  MAX_MARKDOWN_RENDER_CHARS,
  markdownRenderSlice,
} from '@/lib/messageContentCap';
import type { ChatMessage } from '@/types';

/** Render window — full history stays in store; DOM only mounts the visible tail. */
export const MESSAGE_RENDER_WINDOW = 40;

type MessageThreadProps = {
  messages: ChatMessage[];
  myCollabPeerId: string | null;
  onJumpToCollabDm: (peerId: string) => void;
};

function UserBubbleBody({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const slice = markdownRenderSlice(
    content,
    expanded ? Number.POSITIVE_INFINITY : MAX_MARKDOWN_RENDER_CHARS,
  );
  const visible = expanded ? content : slice.visible;
  return (
    <div className="bubble-body">
      {visible}
      {slice.truncated && !expanded ? (
        <button type="button" className="md-expand" onClick={() => setExpanded(true)}>
          Show full message ({slice.totalChars.toLocaleString()} chars)
        </button>
      ) : null}
    </div>
  );
}

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
              <UserBubbleBody content={m.content} />
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
