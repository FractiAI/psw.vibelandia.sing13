import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleTwoPhase } from '../presentation/ModuleTwoPhase';
import { MODULE_PRESENTATIONS } from '@/content/presentations';

const LIMITS = ['Hallucinations', 'Context limits', 'GPU dependence', 'Energy usage', 'Fragmented memory', 'Scaling costs', 'Long-term reasoning', 'Explainability', 'Retrieval overhead'];

const SCENARIOS = [
  {
    id: 'support',
    title: 'Enterprise support bot',
    issue: 'Customer asks about a policy change from last week.',
    bottlenecks: ['Context limits', 'Fragmented memory', 'Hallucinations'],
  },
  {
    id: 'research',
    title: 'Research acceleration',
    issue: 'Summarize 10,000 papers for a drug target.',
    bottlenecks: ['Retrieval overhead', 'Scaling costs', 'Explainability'],
  },
  {
    id: 'legal',
    title: 'Contract review',
    issue: 'Flag non-standard clauses across 200 MSAs.',
    bottlenecks: ['Hallucinations', 'Explainability', 'Long-term reasoning'],
  },
];

export function TradeoffsModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [scenario, setScenario] = useState(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);

  const sc = SCENARIOS[scenario];
  const toggle = (b: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(b)) next.delete(b);
      else next.add(b);
      return next;
    });
  };

  const check = () => {
    setRevealed(true);
    if (sc.bottlenecks.filter((b) => picked.has(b)).length >= 2) mark('m4-tradeoffs');
  };

  return (
    <ModuleTwoPhase
      presentation={MODULE_PRESENTATIONS['m4-tradeoffs']}
      kicker="Module 4"
      title="Where Today's AI Excels — and Struggles"
      lead="~7 minutes on strengths and structural limits, then enterprise scenario tradeoff games."
      minutes={15}
      practiceTitle="Practice · Scenario tradeoffs"
      practiceLead="Pick the bottlenecks you would flag for leadership in each scenario."
      onComplete={() => complete('m4-tradeoffs')}
    >
      <div className="eo-card p-6">
        <p className="text-sm font-medium text-ink">Scenario simulator</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setScenario(i); setPicked(new Set()); setRevealed(false); }}
              className={`eo-btn-ghost text-xs ${scenario === i ? 'bg-accent-soft' : ''}`}
            >
              {s.title}
            </button>
          ))}
        </div>
        <p className="mt-4 text-ink-muted">{sc.issue}</p>
        <p className="mt-2 text-xs text-ink-faint">Select bottlenecks from the presentation:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LIMITS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${picked.has(b) ? 'border-accent bg-accent-soft' : 'border-[var(--eo-border)]'}`}
            >
              {b}
            </button>
          ))}
        </div>
        <button type="button" className="eo-btn-primary mt-4" onClick={check}>Evaluate tradeoffs</button>
        {revealed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-ink-muted">
            Key bottlenecks: {sc.bottlenecks.join(', ')}.
          </motion.p>
        )}
      </div>
    </ModuleTwoPhase>
  );
}
