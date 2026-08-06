import { useMemo } from 'react';
import { UnifiedFeedCard } from '@/components/collaborate/UnifiedFeedCard';
import { feedItemToAgentContext, useUnifiedFeed } from '@/feed/store';
import type { EventFilterKey, IntegrationConfig, UnifiedFeedItem } from '@/feed/types';

function passesFilters(
  item: UnifiedFeedItem,
  integrations: IntegrationConfig[],
  filters: Record<EventFilterKey, boolean>,
): boolean {
  if (item.platform === 'github' || item.platform === 'gitlab') {
    const id = item.platform === 'gitlab' ? 'gitlab' : 'github';
    if (!integrations.find((i) => i.id === id)?.enabled) return false;
    if (item.kind === 'git_event' && item.git) {
      if (item.git.action === 'commit' && !filters.commits) return false;
      if (item.git.action === 'push' && !filters.pushes) return false;
      if ((item.git.action === 'merge' || item.git.action === 'pr') && !filters.merges) return false;
    }
  }
  if (item.platform === 'facebook') {
    if (!integrations.find((i) => i.id === 'facebook')?.enabled) return false;
    if (item.kind === 'social_post' && !filters.social_posts) return false;
  }
  if (item.platform === 'whatsapp') {
    if (!integrations.find((i) => i.id === 'whatsapp')?.enabled) return false;
    if (item.kind === 'messaging' && !filters.messaging) return false;
  }
  if (item.kind === 'artifact' && item.artifact?.kind === 'whitepaper' && !filters.whitepapers) {
    return false;
  }
  return true;
}

export function UnifiedFeedStream({
  compact = false,
  onConvert,
}: {
  compact?: boolean;
  onConvert?: (prompt: string) => void;
}) {
  const rawItems = useUnifiedFeed((s) => s.items);
  const integrations = useUnifiedFeed((s) => s.integrations);
  const eventFilters = useUnifiedFeed((s) => s.eventFilters);
  const peers = useUnifiedFeed((s) => s.peers);

  const items = useMemo(
    () =>
      rawItems
        .filter((i) => passesFilters(i, integrations, eventFilters))
        .slice()
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [rawItems, integrations, eventFilters],
  );

  const typing = peers.find((p) => p.typing);
  const anyFeedOn = integrations.some((i) => i.enabled);

  function onOpenContext(item: UnifiedFeedItem) {
    const prompt = `Convert this unified-feed item into a task/commit:\n${feedItemToAgentContext(item)}`;
    onConvert?.(prompt);
  }

  return (
    <div className={`uf-stream${compact ? ' uf-stream--compact' : ''}`}>
      {items.length === 0 ? (
        <div className="uf-empty">
          <p className="uf-empty__lead">
            {anyFeedOn
              ? 'Feed is quiet — waiting for the next event.'
              : 'Your feed is ready. Configure integrations to begin.'}
          </p>
          <p className="uf-empty__hint">
            {anyFeedOn
              ? 'GitHub pushes, WhatsApp bridges, and Lattice messages appear here as they arrive.'
              : 'Open Settings → enable GitHub, WhatsApp, or Facebook. Only Valet Pru and Daniel are seated for now.'}
          </p>
        </div>
      ) : (
        items.map((item) => (
          <UnifiedFeedCard key={item.id} item={item} onOpenContext={onOpenContext} />
        ))
      )}
      {typing ? (
        <p className="uf-typing" data-hue={typing.hue}>
          <span className="uf-typing__dot" data-hue={typing.hue} />
          {typing.name} typing…
        </p>
      ) : null}
    </div>
  );
}
