import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleShell } from '../shell/CourseShell';

const CASES = [
  { id: 'km', title: 'Knowledge management', now: 'Search + static wikis', forward: 'Living semantic fields (proposed)' },
  { id: 'research', title: 'Research acceleration', now: 'LLM-assisted literature review', forward: 'Multi-scale pattern synthesis (proposed)' },
  { id: 'twins', title: 'Digital twins', now: 'Sensor → model → dashboard', forward: 'Recursive system mirrors (proposed)' },
  { id: 'gov', title: 'Governance & responsible AI', now: 'Policy + audit trails', forward: 'Transparent reconstruction paths (proposed)' },
  { id: 'collab', title: 'Human-AI collaboration', now: 'Copilots + approval flows', forward: 'Resonant co-reasoning (proposed)' },
];

export function EnterpriseModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [explored, setExplored] = useState<Set<string>>(new Set());

  const explore = (id: string) => {
    const next = new Set(explored).add(id);
    setExplored(next);
    if (next.size === CASES.length) mark('m8-enterprise');
  };

  return (
    <ModuleShell
      kicker="Module 8"
      title="Enterprise Implications"
      lead="Explore industry applications. Each card distinguishes current capabilities from forward-looking concepts."
      minutes={5}
      onContinue={() => complete('m8-enterprise')}
      continueDisabled={explored.size < CASES.length}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {CASES.map((c, i) => (
          <motion.button
            key={c.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => explore(c.id)}
            className={`eo-card p-5 text-left transition hover:shadow-glow ${
              explored.has(c.id) ? 'ring-1 ring-accent' : ''
            }`}
          >
            <p className="font-semibold text-ink">{c.title}</p>
            <p className="mt-2 text-xs text-ink-muted">
              <span className="font-medium text-ink">Today:</span> {c.now}
            </p>
            <p className="mt-1 text-xs text-accent">
              <span className="font-medium">Forward (proposed):</span> {c.forward}
            </p>
          </motion.button>
        ))}
      </div>
      <p className="text-center text-xs text-ink-faint">{explored.size}/{CASES.length} case studies viewed</p>
    </ModuleShell>
  );
}
