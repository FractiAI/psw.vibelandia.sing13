import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleTwoPhase } from '../presentation/ModuleTwoPhase';
import { MODULE_PRESENTATIONS } from '@/content/presentations';

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
    <ModuleTwoPhase
      presentation={MODULE_PRESENTATIONS['m6-compare']}
      kicker="Module 6"
      title="Comparing Architectural Paradigms"
      lead="~7 minute decision matrix briefing, then expand each comparison row in the practice game."
      minutes={15}
      practiceTitle="Practice · Paradigm dashboard"
      practiceLead="Open every row and connect today's operational stack to the proposed direction."
      onComplete={() => complete('m6-compare')}
    >
      <div className="space-y-2">
        {COMPARISONS.map((c, i) => (
          <div key={c.traditional} className="eo-card overflow-hidden">
            <button type="button" onClick={() => openRow(i)} className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-accent-soft/30">
              <div className="grid flex-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <span className="text-sm text-ink-muted">{c.traditional}</span>
                <span className="text-sm font-medium text-accent">{c.proposed}</span>
              </div>
              <span className="text-ink-faint">{viewed.has(i) ? '✓' : '+'}</span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[var(--eo-border)] px-4 pb-4">
                  <p className="pt-3 text-sm text-ink-muted">{c.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-ink-faint">{viewed.size}/{COMPARISONS.length} comparisons explored</p>
    </ModuleTwoPhase>
  );
}
