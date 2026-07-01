import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ModulePresentation } from '@/content/presentations';
import { useNewscastNarration } from '@/hooks/useNewscastNarration';
import { useCourseStore } from '@/store/courseStore';
import { NewscastStage } from './NewscastStage';
import { PassiveDetailCard } from '../presentation/PassiveDetailCard';

interface Props {
  presentation: ModulePresentation;
  showTitle: string;
  onBroadcastEnd?: () => void;
}

export function NewscastDeck({ presentation, showTitle, onBroadcastEnd }: Props) {
  const audioUnlocked = useCourseStore((s) => s.audioUnlocked);
  const learnerPath = useCourseStore((s) => s.learnerPath);
  const completed = useCourseStore((s) => s.moduleProgress[presentation.moduleId]?.completed);
  const feedRef = useRef<HTMLDivElement>(null);

  const narration = useNewscastNarration(presentation, {
    autoStart: (audioUnlocked || !!learnerPath) && !completed,
    onEnded: onBroadcastEnd,
  });

  const activeSection = useMemo(() => {
    const sid = narration.current?.sectionId;
    if (!sid) return presentation.sections[0];
    return presentation.sections.find((s) => s.id === sid) ?? presentation.sections[0];
  }, [narration.current, presentation.sections]);

  useEffect(() => {
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeSection?.id, narration.current?.cardId]);

  return (
    <div className="space-y-6">
      <NewscastStage showTitle={showTitle} minutes={presentation.presentationMinutes} narration={narration} />

      <div ref={feedRef} className="scroll-mt-24">
        {activeSection && (
          <motion.section
            key={activeSection.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Now covering</p>
            <h3 className="mt-1 text-xl font-semibold text-ink">{activeSection.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">{activeSection.narrative}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {activeSection.cards.map((card) => (
                <PassiveDetailCard
                  key={card.id}
                  card={card}
                  active={card.id === narration.current?.cardId}
                />
              ))}
            </div>

            {activeSection.insight && narration.current?.kind === 'insight' && (
              <div className="mt-5 rounded-xl border border-dashed border-accent/35 bg-surface px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">Key insight</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{activeSection.insight}</p>
              </div>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}
