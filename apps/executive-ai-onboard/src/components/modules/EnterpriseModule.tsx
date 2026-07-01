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
      lead="Translate architecture into operating decisions across knowledge, workflows, governance, and future platform posture."
      minutes={5}
      onContinue={() => complete('m8-enterprise')}
      continueDisabled={false}
    >
      <div className="eo-card p-6">
        <p className="eo-kicker">Knowledge transfer</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Enterprise action model</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--eo-border)] bg-surface p-4">
            <p className="text-sm font-semibold text-ink">Now (12–18 months)</p>
            <p className="mt-2 text-xs text-ink-muted">Ship retrieval-grounded copilots, tighten evals, instrument costs, and harden governance workflows.</p>
          </div>
          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-ink">Next (R&D horizon)</p>
            <p className="mt-2 text-xs text-ink-muted">Prototype recursive memory and contextual reconstruction approaches in bounded domains.</p>
          </div>
        </div>
      </div>

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
