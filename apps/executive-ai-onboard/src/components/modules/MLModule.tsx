import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { usePracticeReady } from '@/hooks/practiceGate';
import { ModuleTwoPhase } from '../presentation/ModuleTwoPhase';
import { MODULE_PRESENTATIONS } from '@/content/presentations';

const PARADIGMS = [
  { id: 'supervised', label: 'Supervised', desc: 'Labeled examples → predict outcomes' },
  { id: 'unsupervised', label: 'Unsupervised', desc: 'Find structure without labels' },
  { id: 'rl', label: 'Reinforcement', desc: 'Reward signals shape behavior' },
  { id: 'self', label: 'Self-supervised', desc: 'Models learn from their own inputs (LLM pre-training)' },
];

export function MLModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [lr, setLr] = useState(0.3);
  const [epochs, setEpochs] = useState(0);
  const [loss, setLoss] = useState(1.2);
  const [paradigm, setParadigm] = useState('supervised');

  useEffect(() => {
    if (epochs >= 8) mark('m3-ml');
  }, [epochs, mark]);

  const trainStep = () => {
    if (epochs >= 8) return;
    const step = lr * (0.85 + Math.random() * 0.1);
    setLoss((l) => Math.max(0.05, l - step));
    setEpochs((e) => e + 1);
  };

  const nodes = [0.2, 0.45, 0.7, 0.55, 0.35];
  const activation = nodes.map((n, i) => n + (1 - loss) * 0.3 * Math.sin(i + epochs));

  usePracticeReady(epochs >= 8);

  return (
    <ModuleTwoPhase
      presentation={MODULE_PRESENTATIONS['m3-ml']}
      kicker="Module 3"
      title="Machine Learning Under the Hood"
      lead="~7 minutes on paradigms, networks, and optimization — then a training simulator."
      minutes={15}
      practiceTitle="Practice · Training simulator"
      practiceLead="Run epochs, watch loss fall, and map paradigms to what you heard in the presentation."
      onComplete={() => complete('m3-ml')}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="eo-card p-6">
          <p className="text-sm font-medium text-ink">Neural network simulator</p>
          <svg viewBox="0 0 280 120" className="mt-4 w-full" aria-hidden>
            {activation.map((y, i) => (
              <motion.circle key={i} cx={40 + i * 50} cy={60} r={12 + (1 - loss) * 8} fill="var(--eo-accent)" animate={{ opacity: 0.4 + (1 - loss) * 0.6 }} />
            ))}
            {activation.slice(0, -1).map((_, i) => (
              <line key={`l${i}`} x1={40 + i * 50 + 12} y1={60} x2={40 + (i + 1) * 50 - 12} y2={60} stroke="var(--eo-accent)" strokeOpacity={0.3 + (1 - loss) * 0.4} />
            ))}
          </svg>
          <div className="mt-4 space-y-4">
            <label className="block text-xs text-ink-muted">
              Learning rate: {lr.toFixed(2)}
              <input type="range" min="0.1" max="0.9" step="0.05" value={lr} onChange={(e) => setLr(parseFloat(e.target.value))} className="mt-1 w-full accent-accent" />
            </label>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Loss: <strong className="text-ink">{loss.toFixed(3)}</strong></span>
              <span className="text-ink-faint">Epoch {epochs}/8</span>
            </div>
            <button type="button" className="eo-btn-primary w-full" onClick={trainStep} disabled={epochs >= 8}>
              {epochs >= 8 ? 'Converged' : 'Train epoch'}
            </button>
          </div>
        </div>
        <div className="eo-card p-6">
          <p className="text-sm font-medium text-ink">Match the paradigm</p>
          <div className="mt-3 space-y-2">
            {PARADIGMS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setParadigm(p.id)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition ${paradigm === p.id ? 'border-accent bg-accent-soft' : 'border-[var(--eo-border)]'}`}
              >
                <span className="font-semibold text-ink">{p.label}</span>
                <p className="mt-0.5 text-xs text-ink-muted">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModuleTwoPhase>
  );
}
