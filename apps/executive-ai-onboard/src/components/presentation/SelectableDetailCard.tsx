import { motion, AnimatePresence } from 'framer-motion';

export interface DetailCardData {
  id: string;
  title: string;
  summary: string;
  detail: string;
  bullets?: string[];
  tier?: 'verified' | 'operational' | 'proposed';
}

interface Props {
  card: DetailCardData;
  expanded: boolean;
  onToggle: () => void;
}

const TIER_LABEL: Record<NonNullable<DetailCardData['tier']>, string> = {
  verified: '📐 Verified',
  operational: '⚙ Operational',
  proposed: '🜛 Proposed',
};

export function SelectableDetailCard({ card, expanded, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        expanded
          ? 'border-accent bg-accent-soft/40 ring-1 ring-accent/50'
          : 'border-[var(--eo-border)] bg-surface-raised hover:border-accent/40 hover:shadow-card'
      }`}
      aria-expanded={expanded}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {card.tier && (
            <span className="mb-1.5 inline-block text-[0.65rem] font-semibold uppercase tracking-wider text-ink-faint">
              {TIER_LABEL[card.tier]}
            </span>
          )}
          <p className="font-semibold text-ink">{card.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{card.summary}</p>
        </div>
        <span className="mt-1 shrink-0 text-lg text-accent" aria-hidden>
          {expanded ? '−' : '+'}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
      {!expanded && (
        <p className="mt-2 text-xs font-medium text-accent">Tap for full detail →</p>
      )}
    </button>
  );
}
