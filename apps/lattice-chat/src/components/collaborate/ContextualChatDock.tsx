import { FormEvent, useEffect, useState } from 'react';
import { UnifiedFeedStream } from '@/components/collaborate/UnifiedFeedStream';
import { useUnifiedFeed } from '@/feed/store';

export function ContextualChatDock({
  collapsed = false,
  onToggleCollapse,
  onConvertToAgent,
  agentPrompt,
  onAgentPromptConsumed,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onConvertToAgent?: (prompt: string) => void;
  agentPrompt?: string | null;
  onAgentPromptConsumed?: () => void;
}) {
  const [draft, setDraft] = useState('');
  const ingestPayload = useUnifiedFeed((s) => s.ingestPayload);

  useEffect(() => {
    if (agentPrompt) {
      setDraft(agentPrompt);
      onAgentPromptConsumed?.();
    }
  }, [agentPrompt, onAgentPromptConsumed]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (/^Convert this |^Ask agent /i.test(text)) {
      onConvertToAgent?.(text);
      setDraft('');
      return;
    }
    ingestPayload({
      type: 'chat',
      platform: 'lattice',
      actor: 'You',
      body: text,
      presenceHue: 'gold',
    });
    setDraft('');
  }

  return (
    <aside className={`ctx-dock${collapsed ? ' is-collapsed' : ''}`} aria-label="Contextual Chat">
      <header className="ctx-dock__head">
        <h2>Contextual Chat</h2>
        {onToggleCollapse ? (
          <button type="button" className="ctx-dock__collapse" onClick={onToggleCollapse}>
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        ) : null}
      </header>
      {!collapsed ? (
        <>
          <div className="ctx-dock__stream">
            <UnifiedFeedStream
              compact
              onConvert={(prompt) => {
                setDraft(prompt);
                onConvertToAgent?.(prompt);
              }}
            />
          </div>
          <form className="ctx-dock__composer" onSubmit={onSubmit}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message · agent prompt · convert…"
              aria-label="Contextual chat input"
            />
            <button type="submit" className="ctx-dock__send" aria-label="Send">
              ◆
            </button>
          </form>
        </>
      ) : null}
    </aside>
  );
}
