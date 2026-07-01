import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ModulePresentation } from '@/content/presentations';
import { SelectableDetailCard } from './SelectableDetailCard';

interface Props {
  presentation: ModulePresentation;
}

export function PresentationDeck({ presentation }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-10">
      <div className="eo-card border-accent/25 bg-accent-soft/20 p-5 sm:p-6">
        <p className="eo-kicker">Presentation · ~{presentation.presentationMinutes} min</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{presentation.opening}</p>
        <p className="mt-3 text-xs text-ink-faint">
          Read each section, then tap any card for depth. Practice quiz unlocks at the end.
        </p>
      </div>

      {presentation.sections.map((section, si) => (
        <motion.section
          key={section.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: si * 0.04 }}
          className="scroll-mt-24"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            Part {si + 1} of {presentation.sections.length}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{section.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-muted sm:text-base">{section.narrative}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {section.cards.map((card) => (
              <SelectableDetailCard
                key={card.id}
                card={card}
                expanded={expanded.has(card.id)}
                onToggle={() => toggle(card.id)}
              />
            ))}
          </div>

          {section.insight && (
            <div className="mt-5 rounded-xl border border-dashed border-accent/35 bg-surface px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Key insight</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{section.insight}</p>
            </div>
          )}
        </motion.section>
      ))}

      <div className="rounded-xl border border-[var(--eo-border)] bg-surface-raised p-5">
        <p className="text-sm font-semibold text-ink">Presentation complete</p>
        <p className="mt-1 text-sm text-ink-muted">{presentation.closing}</p>
        {expanded.size > 0 && (
          <p className="mt-2 text-xs text-ink-faint">{expanded.size} detail cards opened — good depth.</p>
        )}
      </div>
    </div>
  );
}
