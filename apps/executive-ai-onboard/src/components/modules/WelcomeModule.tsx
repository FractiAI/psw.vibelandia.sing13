import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import type { LearnerPath } from '@/content/course';
import { ModuleShell } from '../shell/CourseShell';

const PATHS: { id: LearnerPath; label: string; desc: string }[] = [
  { id: 'executive', label: "I'm an executive", desc: 'Strategy, decisions, organizational impact' },
  { id: 'technical', label: "I'm technical", desc: 'Architecture depth with precision' },
  { id: 'familiar', label: 'I know AI well', desc: 'Accelerated pace, fewer basics' },
  { id: 'curious', label: "I'm just curious", desc: 'Clear explanations, no jargon walls' },
];

export function WelcomeModule() {
  const setPath = useCourseStore((s) => s.setLearnerPath);
  const complete = useCourseStore((s) => s.completeModule);
  const unlockAudio = useCourseStore((s) => s.unlockAudio);

  const begin = (path: LearnerPath) => {
    setPath(path);
    unlockAudio();
    window.setTimeout(() => complete('welcome'), 350);
  };

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[var(--eo-gradient)]" />
      <ModuleShell
        kicker="Executive onboarding · Module 1 of many"
        title="How does modern AI actually think?"
        lead="Sit back — pick your lens and the anchor handles the rest. Player controls + practice quizzes only."
        minutes={3}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="eo-card overflow-hidden p-1"
        >
          <div className="rounded-xl bg-gradient-to-br from-accent/20 via-transparent to-accent-soft p-8 sm:p-12 text-center">
            <p className="text-sm font-medium text-ink-muted">Estimated completion</p>
            <p className="mt-1 font-display text-5xl font-semibold tracking-tight text-ink">54</p>
            <p className="text-sm text-ink-faint">minutes · mostly hands-free</p>
          </div>
        </motion.div>

        <div>
          <p className="mb-4 text-sm font-medium text-ink">One tap to start — choose your lens.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PATHS.map((p, i) => (
              <motion.button
                key={p.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => begin(p.id)}
                className="eo-card p-5 text-left transition-all hover:shadow-glow hover:ring-2 hover:ring-accent/50"
              >
                <p className="font-semibold text-ink">{p.label}</p>
                <p className="mt-1 text-sm text-ink-muted">{p.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[var(--eo-border)] p-4 text-xs text-ink-faint">
          <strong className="text-ink-muted">Honesty boundary:</strong> Established AI concepts are taught objectively.
          Fractal-Holographic architecture is presented as a <em>proposed</em> framework — clearly labeled throughout.
        </div>
      </ModuleShell>
    </div>
  );
}
