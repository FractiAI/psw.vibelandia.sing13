import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleShell } from '../shell/CourseShell';

const FRACTAL_POINTS = [
  'Recursive organization',
  'Self-similarity across scales',
  'Hierarchical knowledge',
  'Multi-scale abstraction',
  'Dynamic semantic routing',
];

const HOLO_POINTS = [
  'Distributed representation',
  'Whole-in-the-part encoding',
  'Associative memory',
  'Context reconstruction',
  'Fault-tolerant redundancy',
];

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

  const ready = viewed.fractal && viewed.holo;

  useEffect(() => {
    if (ready) mark('m5-fractal-holo');
  }, [ready, mark]);

  return (
    <ModuleShell
      kicker="Module 5 · Proposed framework"
      title="Foundations of Fractal-Holographic Architecture"
      lead="Separate what is established today from what is proposed next; then explore interactive metaphors for the proposal."
      minutes={8}
      onContinue={() => complete('m5-fractal-holo')}
      continueDisabled={false}
    >
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-ink-muted">
        <strong className="text-amber-700 dark:text-amber-300">Proposal tier:</strong> Fractal-Holographic architecture is a conceptual framework — not industry standard. Compare to established transformer pipelines in Module 6.
      </div>

      <div className="eo-card p-6">
        <p className="eo-kicker">Knowledge transfer</p>
        <h3 className="mt-2 text-lg font-semibold text-ink">Established vs proposed (clear boundary)</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--eo-border)] bg-surface p-4">
            <p className="text-sm font-semibold text-ink">Established today</p>
            <ul className="mt-2 space-y-1 text-xs text-ink-muted">
              <li>· Transformer inference over tokenized context</li>
              <li>· Retrieval systems for external memory</li>
              <li>· Vector embedding similarity for lookup</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-ink">Proposed Fractal-Holographic direction</p>
            <ul className="mt-2 space-y-1 text-xs text-ink-muted">
              <li>· Recursive organization across scales</li>
              <li>· Whole-in-part contextual reconstruction</li>
              <li>· Pattern-centric synthesis over linear retrieval</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="eo-card p-6">
          <p className="text-sm font-semibold text-ink">Fractal zoom</p>
          <button type="button" onClick={exploreFractal} className="mt-4 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-accent-soft">
            <motion.div
              animate={{ scale: zoom }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="grid grid-cols-3 gap-1 p-4"
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-8 w-8 rounded border border-accent/40 bg-accent/20" />
              ))}
            </motion.div>
          </button>
          <p className="mt-3 text-xs text-ink-faint">Tap to zoom — patterns repeat at each scale (depth {zoom.toFixed(1)}×)</p>
          <ul className="mt-4 space-y-1">
            {FRACTAL_POINTS.map((p) => (
              <li key={p} className="text-xs text-ink-muted">· {p}</li>
            ))}
          </ul>
        </div>

        <div className="eo-card p-6">
          <p className="text-sm font-semibold text-ink">Holographic fragment</p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => exploreHolo(i)}
                className={`h-10 w-10 rounded-lg border transition ${
                  fragment === i ? 'border-accent bg-accent scale-110' : 'border-[var(--eo-border)] bg-surface'
                }`}
                aria-label={`Fragment ${i + 1}`}
              />
            ))}
          </div>
          <motion.p
            key={fragment}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-lg bg-accent-soft p-3 text-xs text-ink-muted"
          >
            Fragment {fragment + 1} encodes context about the whole network — associative reconstruction suggests related concepts without linear search.
          </motion.p>
          <ul className="mt-4 space-y-1">
            {HOLO_POINTS.map((p) => (
              <li key={p} className="text-xs text-ink-muted">· {p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="eo-card overflow-hidden">
        <div className="grid sm:grid-cols-2">
          <div className="border-b sm:border-b-0 sm:border-r border-[var(--eo-border)] p-5">
            <p className="eo-kicker">Traditional</p>
            <p className="mt-2 font-mono text-sm text-ink-muted">Store → Search → Retrieve → Return</p>
          </div>
          <div className="p-5">
            <p className="eo-kicker">Fractal-Holographic (proposed)</p>
            <p className="mt-2 font-mono text-sm text-accent">Observe → Organize → Resonate → Reconstruct → Generate</p>
          </div>
        </div>
      </div>
    </ModuleShell>
  );
}
