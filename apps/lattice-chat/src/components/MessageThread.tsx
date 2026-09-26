import { KeyboardEvent, memo } from 'react';
import { AgentTranscript } from '@/components/AgentTranscript';
import { MarkdownBody } from '@/components/MarkdownBody';
import { TokenCompareFooter, hasMeasuredTokens } from '@/components/TokenCompare';
import { peerNameForId } from '@/feed/seatIdentity';
import type { ChatMessage } from '@/types';

type MessageThreadProps = {
  messages: ChatMessage[];
  myCollabPeerId: string | null;
  onJumpToCollabDm: (peerId: string) => void;
};

/**
 * Memoized message list — must not re-render on composer keystrokes.
 */
export const MessageThread = memo(function MessageThread({
  messages,
  myCollabPeerId,
  onJumpToCollabDm,
}: MessageThreadProps) {
  return (
    <>
      {messages.map((m) => {
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
              <AgentTranscript items={m.transcript} />
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
