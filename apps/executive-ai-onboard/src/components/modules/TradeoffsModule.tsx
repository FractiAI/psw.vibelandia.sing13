import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleShell } from '../shell/CourseShell';

const STRENGTHS = ['Pattern recognition', 'Language generation', 'Vision', 'Code generation', 'Automation'];
const LIMITS = ['Hallucinations', 'Context limits', 'GPU dependence', 'Energy usage', 'Fragmented memory', 'Scaling costs', 'Long-term reasoning', 'Explainability'];

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
];

export function TradeoffsModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [scenario, setScenario] = useState(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(false);

  const sc = SCENARIOS[scenario];
  const toggle = (b: string) => {
    const next = new Set(picked);
    if (next.has(b)) next.delete(b);
    else next.add(b);
    setPicked(next);
  };

  const check = () => {
    setRevealed(true);
    const hits = sc.bottlenecks.filter((b) => picked.has(b)).length;
    if (hits >= 2) mark('m4-tradeoffs');
  };

  const done = revealed && sc.bottlenecks.filter((b) => picked.has(b)).length >= 2;

  return (
    <ModuleShell
      kicker="Module 4"
      title="Where Today's AI Excels — and Struggles"
      lead="Learn the capability map and constraint map first; then use scenarios to practice prioritizing tradeoffs."
      minutes={8}
      onContinue={() => complete('m4-tradeoffs')}
      continueDisabled={false}
    >
      <div className="eo-card p-6">
        <p className="eo-kicker">Knowledge transfer</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Executive decision frame</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--eo-border)] bg-surface p-4">
            <p className="text-sm font-semibold text-ink">Use AI aggressively when</p>
            <ul className="mt-2 space-y-1 text-xs text-ink-muted">
              <li>· Pattern recognition dominates</li>
              <li>· Human-in-the-loop is acceptable</li>
              <li>· Errors are detectable and recoverable</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--eo-border)] bg-surface p-4">
            <p className="text-sm font-semibold text-ink">Apply tighter controls when</p>
            <ul className="mt-2 space-y-1 text-xs text-ink-muted">
              <li>· High regulatory or safety exposure</li>
              <li>· Long-horizon reasoning is required</li>
              <li>· Source traceability is mandatory</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="eo-card p-5">
          <p className="eo-kicker text-emerald-600 dark:text-emerald-400">Strengths</p>
          <ul className="mt-3 space-y-2">
            {STRENGTHS.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm text-ink-muted">
                <span className="text-emerald-500">●</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="eo-card p-5">
          <p className="eo-kicker text-amber-600 dark:text-amber-400">Limitations</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {LIMITS.map((l) => (
              <span key={l} className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-ink-muted">
                {l}
              </span>
            ))}
          </ul>
        </div>
      </div>

      <div className="eo-card p-6">
        <p className="text-sm font-medium text-ink">Scenario simulator</p>
        <div className="mt-3 flex gap-2">
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
        <p className="mt-2 text-xs text-ink-faint">Select the bottlenecks you'd flag for leadership:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...LIMITS, 'Retrieval overhead'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                picked.has(b) ? 'border-accent bg-accent-soft' : 'border-[var(--eo-border)]'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <button type="button" className="eo-btn-primary mt-4" onClick={check}>
          Evaluate tradeoffs
        </button>
        {revealed && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-ink-muted">
            Key bottlenecks: {sc.bottlenecks.join(', ')}.{' '}
            {done ? 'Solid executive read.' : 'Consider retrieval, memory, and verification gaps.'}
          </motion.p>
        )}
      </div>
    </ModuleShell>
  );
}
