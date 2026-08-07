import type { UnifiedFeedItem } from '@/feed/types';
import { useUnifiedFeed } from '@/feed/store';

const PLATFORM_BADGE: Record<string, string> = {
  github: 'GH',
  gitlab: 'GL',
  facebook: 'f',
  whatsapp: 'WA',
  lattice: '◆',
};

export function UnifiedFeedCard({
  item,
  onOpenContext,
}: {
  item: UnifiedFeedItem;
  onOpenContext?: (item: UnifiedFeedItem) => void;
}) {
  const openRepoFromItem = useUnifiedFeed((s) => s.openRepoFromItem);
  const time = formatTime(item.createdAt);
  const isCard = item.kind === 'git_event' || item.kind === 'social_post' || item.kind === 'artifact';

  if (!isCard) {
    return (
      <article className={`uf-msg uf-msg--${item.platform}`} data-kind={item.kind}>
        <div className="uf-msg__avatar" data-hue={item.presenceHue || 'gold'} aria-hidden>
          {initials(item.actor)}
          {item.presenceHue ? <span className="uf-presence" data-hue={item.presenceHue} /> : null}
        </div>
        <div className="uf-msg__body">
          <header className="uf-msg__head">
            <strong>{item.actor}</strong>
            <span className="uf-badge" data-platform={item.platform}>
              {PLATFORM_BADGE[item.platform] || item.sourceLabel}
            </span>
            <span className="uf-time">{time}</span>
          </header>
          <p className="uf-msg__text">{item.body}</p>
          {item.kind === 'messaging' ? (
            <div className="uf-card__actions">
              <button type="button" onClick={() => onOpenContext?.(item)}>
                Reply to thread
              </button>
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className={`uf-card uf-card--${item.kind}`} data-platform={item.platform}>
      <header className="uf-card__meta">
        <span className="uf-badge" data-platform={item.platform}>
          {PLATFORM_BADGE[item.platform] || item.sourceLabel}
        </span>
        <span className="uf-card__source">{item.sourceLabel}</span>
        <span className="uf-time">{time}</span>
      </header>
      <div className="uf-card__panel">
        {item.kind === 'git_event' && item.git ? (
          <>
            <p className="uf-card__title">
              [{item.git.repo}] {item.git.summary}
              {item.git.compareUrl ? (
                <>
                  {' — '}
                  <a href={item.git.compareUrl} target="_blank" rel="noopener noreferrer">
                    view comparison
                  </a>
                </>
              ) : null}
            </p>
            <div className="uf-card__actions">
              <button type="button" onClick={() => openRepoFromItem(item)}>
                View Diff
              </button>
              <button type="button" onClick={() => onOpenContext?.(item)}>
                Convert to Task
              </button>
            </div>
          </>
        ) : null}
        {item.kind === 'social_post' && item.social ? (
          <>
            <p className="uf-card__title">{item.social.title}</p>
            {item.social.body && item.social.body !== item.social.title ? (
              <p className="uf-card__sub">{item.social.body}</p>
            ) : null}
            <div className="uf-card__actions">
              {item.social.url ? (
                <a className="uf-card__linkbtn" href={item.social.url}>
                  Read
                </a>
              ) : null}
              <button type="button" onClick={() => onOpenContext?.(item)}>
                Convert to Task
              </button>
            </div>
          </>
        ) : null}
        {item.kind === 'artifact' && item.artifact ? (
          <>
            <p className="uf-card__title">{item.artifact.title}</p>
            <p className="uf-card__sub">
              {item.artifact.kind === 'whitepaper' ? 'Whitepaper' : item.artifact.kind}
              {item.artifact.published ? ` · ${item.artifact.published}` : ''}
            </p>
            <div className="uf-card__actions">
              {item.artifact.url ? (
                <a className="uf-card__linkbtn" href={item.artifact.url}>
                  Read
                </a>
              ) : (
                <button type="button" onClick={() => openRepoFromItem(item)}>
                  Open artifact
                </button>
              )}
              <button type="button" onClick={() => onOpenContext?.(item)}>
                Convert to Task
              </button>
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}
