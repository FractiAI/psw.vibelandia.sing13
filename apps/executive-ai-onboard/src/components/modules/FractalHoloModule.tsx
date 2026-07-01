import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleTwoPhase } from '../presentation/ModuleTwoPhase';
import { MODULE_PRESENTATIONS } from '@/content/presentations';

export function FractalHoloModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [zoom, setZoom] = useState(1);
  const [fragment, setFragment] = useState(0);
  const [viewed, setViewed] = useState({ fractal: false, holo: false });

  const exploreFractal = () => {
    setZoom((z) => (z >= 3 ? 1 : z + 0.5));
    setViewed((v) => ({ ...v, fractal: true }));
  };

  const exploreHolo = (idx: number) => {
    setFragment(idx);
    setViewed((v) => ({ ...v, holo: true }));
  };

  useEffect(() => {
    if (viewed.fractal && viewed.holo) mark('m5-fractal-holo');
  }, [viewed, mark]);

  return (
    <ModuleTwoPhase
      presentation={MODULE_PRESENTATIONS['m5-fractal-holo']}
      kicker="Module 5 · Proposed framework"
      title="Foundations of Fractal-Holographic Architecture"
      lead="~8 minutes teaching the proposal with clear honesty boundaries, then interactive fractal and holographic metaphors."
      minutes={16}
      practiceTitle="Practice · Fractal & holographic explorer"
      practiceLead="Use the zoom and fragment tools to internalize the concepts from the presentation."
      onComplete={() => complete('m5-fractal-holo')}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="eo-card p-6">
          <p className="text-sm font-semibold text-ink">Fractal zoom</p>
          <button type="button" onClick={exploreFractal} className="mt-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-accent-soft">
            <motion.div animate={{ scale: zoom }} transition={{ type: 'spring', stiffness: 200 }} className="grid grid-cols-3 gap-1 p-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-8 w-8 rounded border border-accent/40 bg-accent/20" />
              ))}
            </motion.div>
          </button>
          <p className="mt-3 text-xs text-ink-faint">Tap to zoom — recursive scale (depth {zoom.toFixed(1)}×)</p>
        </div>
        <div className="eo-card p-6">
          <p className="text-sm font-semibold text-ink">Holographic fragment</p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => exploreHolo(i)}
                className={`h-10 w-10 rounded-lg border transition ${fragment === i ? 'border-accent bg-accent scale-110' : 'border-[var(--eo-border)] bg-surface'}`}
                aria-label={`Fragment ${i + 1}`}
              />
            ))}
          </div>
          <motion.p key={fragment} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-lg bg-accent-soft p-3 text-xs text-ink-muted">
            Fragment {fragment + 1}: associative reconstruction — broader context recoverable from a partial view (proposed metaphor).
          </motion.p>
        </div>
      </div>
    </ModuleTwoPhase>
  );
}
