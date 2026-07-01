import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleShell } from '../shell/CourseShell';

const COMPARISONS = [
  { traditional: 'Linear pipelines', proposed: 'Recursive networks', detail: 'Data flows through fixed stages vs self-similar processing at every scale.' },
  { traditional: 'Centralized context window', proposed: 'Distributed contextual reconstruction', detail: 'Single context limit vs holographic reassembly from fragments.' },
  { traditional: 'Static vector indexes', proposed: 'Recursive indexing', detail: 'One-time embedding store vs evolving semantic topology.' },
  { traditional: 'Token prediction', proposed: 'Pattern synthesis', detail: 'Next-token probability vs emergent pattern completion.' },
  { traditional: 'Separate memory systems', proposed: 'Integrated recursive memory', detail: 'RAG bolt-on vs memory as architecture.' },
  { traditional: 'Sequential processing', proposed: 'Recursive parallel organization', detail: 'Batch inference vs fractal concurrency model.' },
  { traditional: 'Fixed model architecture', proposed: 'Adaptive self-organizing architecture', detail: 'Frozen weights vs proposed dynamic reconfiguration.' },
];

export function CompareModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [open, setOpen] = useState<number | null>(null);
  const [viewed, setViewed] = useState<Set<number>>(new Set());

  const openRow = (i: number) => {
    setOpen(i);
    const next = new Set(viewed).add(i);
    setViewed(next);
    if (next.size === COMPARISONS.length) mark('m6-compare');
  };

  return (
    <ModuleShell
      kicker="Module 6"
      title="Comparing Architectural Paradigms"
      lead="Use this as a decision matrix: current-state architecture on the left, proposed architectural direction on the right."
      minutes={8}
      onContinue={() => complete('m6-compare')}
      continueDisabled={false}
    >
      <div className="eo-card p-6">
        <p className="eo-kicker">Knowledge transfer</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">How to read this comparison</h3>
        <ul className="mt-4 space-y-2 text-sm text-ink-muted">
          <li><strong className="text-ink">Left column:</strong> what teams can buy/build today with known tooling.</li>
          <li><strong className="text-ink">Right column:</strong> a proposed direction for reducing retrieval and memory fragmentation.</li>
          <li><strong className="text-ink">Decision rule:</strong> separate near-term execution bets from long-term research bets.</li>
        </ul>
      </div>

      <div className="space-y-2">
        {COMPARISONS.map((c, i) => (
          <div key={c.traditional} className="eo-card overflow-hidden">
            <button
              type="button"
              onClick={() => openRow(i)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-accent-soft/30"
            >
              <div className="grid flex-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <span className="text-sm text-ink-muted">{c.traditional}</span>
                <span className="text-sm font-medium text-accent">{c.proposed}</span>
              </div>
              <span className="text-ink-faint">{viewed.has(i) ? '✓' : '+'}</span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[var(--eo-border)] px-4 pb-4"
                >
                  <p className="pt-3 text-sm text-ink-muted">{c.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-ink-faint">{viewed.size}/{COMPARISONS.length} comparisons explored</p>
    </ModuleShell>
  );
}
