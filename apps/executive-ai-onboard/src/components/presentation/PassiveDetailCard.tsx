import type { DetailCardData } from '@/content/presentations';

const TIER_LABEL: Record<NonNullable<DetailCardData['tier']>, string> = {
  verified: '📐 Verified',
  operational: '⚙ Operational',
  proposed: '🜛 Proposed',
};

interface Props {
  card: DetailCardData;
  active: boolean;
}

export function PassiveDetailCard({ card, active }: Props) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        active
          ? 'border-accent bg-accent-soft/40 ring-1 ring-accent/50'
          : 'border-[var(--eo-border)] bg-surface-raised opacity-80'
      }`}
    >
      {card.tier && (
        <span className="mb-1.5 inline-block text-[0.65rem] font-semibold uppercase tracking-wider text-ink-faint">
          {TIER_LABEL[card.tier]}
        </span>
      )}
      <p className="font-semibold text-ink">{card.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">{card.summary}</p>
      {active && (
        <div className="mt-4 border-t border-[var(--eo-border)] pt-4">
          <p className="text-sm leading-relaxed text-ink-muted">{card.detail}</p>
          {card.bullets && card.bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {card.bullets.map((b) => (
                <li key={b} className="text-sm text-ink-muted before:mr-2 before:text-accent before:content-['·']">
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
