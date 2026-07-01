import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { NEXT_COURSE } from '@/content/course';
import { ModuleShell } from '../shell/CourseShell';

export function CompletionModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const reset = useCourseStore((s) => s.resetCourse);
  const path = useCourseStore((s) => s.learnerPath);
  const completedAt = useCourseStore((s) => s.completedAt);
  const [morph, setMorph] = useState(0);
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    if (completedAt) setShowCert(true);
  }, [completedAt]);

  useEffect(() => {
    const t = setInterval(() => setMorph((m) => (m >= 100 ? 100 : m + 2)), 40);
    return () => clearInterval(t);
  }, []);

  const handleComplete = () => {
    complete('completion');
    setShowCert(true);
  };

  return (
    <ModuleShell
      kicker="Final module"
      title="Executive Summary"
      lead="You now hold a clear mental model for technology strategy conversations — today's AI and tomorrow's proposed paradigm."
      minutes={4}
      onContinue={handleComplete}
      continueLabel="Complete & view certificate"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="eo-card p-5">
          <p className="eo-kicker">Today's AI</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
            {['Data-driven', 'Statistical', 'Transformer-centric', 'Compute intensive', 'Highly capable'].map((t) => (
              <li key={t}>· {t}</li>
            ))}
          </ul>
        </div>
        <div className="eo-card p-5 border-accent/30">
          <p className="eo-kicker">Fractal-Holographic (conceptual)</p>
          <ul className="mt-3 space-y-1.5 text-sm text-ink-muted">
            {['Recursive organization', 'Distributed representation', 'Context reconstruction', 'Multi-scale knowledge', 'Pattern-centric reasoning'].map((t) => (
              <li key={t}>· {t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="eo-card p-8">
        <p className="text-center text-sm font-medium text-ink">Architecture transition</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex flex-col gap-1">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-3 w-24 rounded bg-ink-faint/30"
                animate={{ opacity: morph > 50 ? 0.3 : 1 }}
              />
            ))}
          </div>
          <motion.span animate={{ rotate: morph * 3.6 }} className="text-2xl text-accent">
            →
          </motion.span>
          <div className="relative h-24 w-24">
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-accent"
              animate={{ scale: 0.6 + morph * 0.004, rotate: morph * 0.5 }}
              style={{ transformOrigin: 'center' }}
            />
            <motion.div
              className="absolute inset-2 rounded-lg border border-accent/50"
              animate={{ scale: 0.5 + morph * 0.005, rotate: -morph * 0.3 }}
            />
            <motion.div
              className="absolute inset-4 rounded border border-accent/30"
              animate={{ scale: 0.4 + morph * 0.006 }}
            />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-faint">Linear pipeline → recursive fractal-holographic field</p>
      </div>

      {showCert && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="eo-card border-accent/40 p-8 text-center"
        >
          <p className="eo-kicker">Certificate of completion</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Executive AI Onboarding</h2>
          <p className="mt-2 text-sm text-ink-muted">
            54-minute module · {path ?? 'executive'} lens · {new Date().toLocaleDateString()}
          </p>
          <p className="mt-4 text-xs text-ink-faint">Save this screen — personalized progress stored locally on your device.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="eo-btn-outline" onClick={() => window.print()}>
              Download / Print
            </button>
            <button type="button" className="eo-btn-ghost" onClick={reset}>
              Restart course
            </button>
          </div>
          <div className="mt-8 rounded-xl bg-accent-soft p-4">
            <p className="text-sm font-semibold text-ink">Suggested next</p>
            <p className="mt-1 text-accent">{NEXT_COURSE.title}</p>
            <p className="text-xs text-ink-muted">{NEXT_COURSE.subtitle} · {NEXT_COURSE.status}</p>
          </div>
        </motion.div>
      )}
    </ModuleShell>
  );
}
