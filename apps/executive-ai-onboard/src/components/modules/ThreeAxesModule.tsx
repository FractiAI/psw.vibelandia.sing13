import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleTwoPhase } from '../presentation/ModuleTwoPhase';
import { MODULE_PRESENTATIONS } from '@/content/presentations';

const AXES = [
  { id: 'data', label: 'Layer 1 — Data', items: ['Collection', 'Storage', 'Persistence', 'Distribution', 'Retrieval'], color: 'from-blue-500/30' },
  { id: 'fractal', label: 'Layer 2 — Fractal Organization', items: ['Recursive hierarchy', 'Multi-scale abstraction', 'Pattern inheritance', 'Semantic topology'], color: 'from-violet-500/30' },
  { id: 'holo', label: 'Layer 3 — Holographic Representation', items: ['Distributed meaning', 'Whole-part coherence', 'Associative reconstruction', 'Multi-perspective encoding'], color: 'from-cyan-500/30' },
];

export function ThreeAxesModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [rotation, setRotation] = useState(0);
  const [active, setActive] = useState(0);
  const [inspected, setInspected] = useState<Set<string>>(new Set());

  const inspect = (id: string, index: number) => {
    setActive(index);
    const next = new Set(inspected).add(id);
    setInspected(next);
    if (next.size >= 3) mark('m7-axes');
  };

  return (
    <ModuleTwoPhase
      presentation={MODULE_PRESENTATIONS['m7-axes']}
      kicker="Module 7"
      title="The Three Axes of Intelligence"
      lead="~7 minutes on data, fractal organization, and holographic representation — then a 3D inspection game."
      minutes={15}
      practiceTitle="Practice · Three-axis model"
      practiceLead="Rotate the model and inspect each layer from the presentation."
      onComplete={() => complete('m7-axes')}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="eo-card flex flex-col items-center justify-center p-8" style={{ perspective: '800px' }}>
          <motion.div animate={{ rotateY: rotation }} transition={{ type: 'spring', stiffness: 80 }} className="relative h-48 w-48" style={{ transformStyle: 'preserve-3d' }}>
            {AXES.map((axis, i) => (
              <div
                key={axis.id}
                className={`absolute inset-0 rounded-2xl border border-[var(--eo-border)] bg-gradient-to-br ${axis.color} to-transparent p-4 flex items-end`}
                style={{ transform: `rotateY(${i * 120}deg) translateZ(90px)`, backfaceVisibility: 'hidden' }}
              >
                <span className="text-xs font-semibold text-ink">{axis.label.split('—')[1]?.trim()}</span>
              </div>
            ))}
          </motion.div>
          <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value, 10))} className="mt-8 w-full max-w-xs accent-accent" aria-label="Rotate 3D model" />
        </div>
        <div className="space-y-3">
          {AXES.map((axis, i) => (
            <button key={axis.id} type="button" onClick={() => inspect(axis.id, i)} className={`eo-card w-full p-4 text-left transition ${active === i ? 'ring-2 ring-accent' : ''}`}>
              <p className="text-sm font-semibold text-ink">{axis.label}</p>
              <ul className="mt-2 flex flex-wrap gap-1">
                {axis.items.map((item) => (
                  <li key={item} className="rounded bg-accent-soft px-2 py-0.5 text-xs text-ink-muted">{item}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-ink-faint">{inspected.size}/3 axes inspected</p>
    </ModuleTwoPhase>
  );
}
