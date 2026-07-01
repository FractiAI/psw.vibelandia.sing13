import { motion, AnimatePresence } from 'framer-motion';
import { COURSE_MODULES, TOTAL_MINUTES, GLOSSARY } from '@/content/course';
import { useCourseStore } from '@/store/courseStore';
import type { ModuleId } from '@/content/course';

export function ProgressRail() {
  const current = useCourseStore((s) => s.currentModule);
  const progress = useCourseStore((s) => s.moduleProgress);
  const pct = useCourseStore((s) => s.progressPercent());
  const goTo = useCourseStore((s) => s.goToModule);
  const idx = COURSE_MODULES.findIndex((m) => m.id === current);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--eo-border)] bg-surface-overlay backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-xs text-ink-faint">
            <span className="truncate font-medium text-ink-muted">
              Module {idx + 1} of {COURSE_MODULES.length}
            </span>
            <span className="shrink-0">{TOTAL_MINUTES} min · {pct}%</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-accent-soft">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-1" aria-label="Module navigation">
          {COURSE_MODULES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => goTo(m.id as ModuleId)}
              className={`h-2 w-2 rounded-full transition-all ${
                progress[m.id as ModuleId]?.completed
                  ? 'bg-accent scale-100'
                  : m.id === current
                    ? 'bg-accent scale-125 ring-2 ring-accent-soft'
                    : 'bg-ink-faint/40 hover:bg-ink-muted'
              }`}
              title={m.title}
              aria-label={`${m.title}${progress[m.id as ModuleId]?.completed ? ' (completed)' : ''}`}
              aria-current={m.id === current ? 'step' : undefined}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

interface TutorSidebarProps {
  hint: string;
}

export function TutorSidebar({ hint }: TutorSidebarProps) {
  const open = useCourseStore((s) => s.tutorOpen);
  const toggle = useCourseStore((s) => s.toggleTutor);
  const path = useCourseStore((s) => s.learnerPath);

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-glow transition hover:scale-105"
        aria-label={open ? 'Close AI tutor' : 'Open AI tutor'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3c-4 0-7 2.5-7 6v4l-2 2h18l-2-2v-4c0-3.5-3-6-7-6z" />
          <path d="M9 21h6" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-20 right-6 z-40 w-[min(340px,calc(100vw-2rem))] eo-card p-5"
            role="complementary"
            aria-label="Learning guide"
          >
            <p className="eo-kicker mb-2">Guide</p>
            <p className="text-sm leading-relaxed text-ink-muted">{hint}</p>
            {path && (
              <p className="mt-3 text-xs text-ink-faint">
                Lens: <span className="font-medium text-ink-muted">{path}</span>
              </p>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export function GlossaryPanel() {
  const open = useCourseStore((s) => s.glossaryOpen);
  const toggle = useCourseStore((s) => s.toggleGlossary);

  if (!open) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-6 left-6 z-40 eo-btn-ghost border border-[var(--eo-border)] bg-surface-raised text-xs"
      >
        Glossary
      </button>
    );
  }

  return (
    <motion.aside
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-h-[50vh] max-w-lg overflow-auto eo-card p-5 sm:inset-x-auto sm:left-6 sm:right-auto sm:w-80"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="eo-kicker">Glossary</p>
        <button type="button" onClick={toggle} className="text-ink-faint hover:text-ink" aria-label="Close glossary">
          ✕
        </button>
      </div>
      <dl className="space-y-3">
        {Object.entries(GLOSSARY).map(([term, def]) => (
          <div key={term}>
            <dt className="text-sm font-semibold text-ink">{term}</dt>
            <dd className="mt-0.5 text-xs leading-relaxed text-ink-muted">{def}</dd>
          </div>
        ))}
      </dl>
    </motion.aside>
  );
}

export function ThemeToggle() {
  const theme = useCourseStore((s) => s.theme);
  const setTheme = useCourseStore((s) => s.setTheme);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="eo-btn-ghost p-2"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}

interface ModuleShellProps {
  kicker: string;
  title: string;
  lead: string;
  minutes: number;
  children: React.ReactNode;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export function ModuleShell({
  kicker,
  title,
  lead,
  minutes,
  children,
  onContinue,
  continueLabel = 'Continue',
  continueDisabled,
}: ModuleShellProps) {
  return (
    <motion.section
      key={title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14"
    >
      <div className="mb-10">
        <p className="eo-kicker">{kicker}</p>
        <h1 className="eo-title mt-2">{title}</h1>
        <p className="eo-lead mt-4">{lead}</p>
        <p className="mt-3 text-xs text-ink-faint">~{minutes} min</p>
      </div>
      <div className="space-y-8">{children}</div>
      {onContinue && (
        <div className="mt-12 flex justify-end border-t border-[var(--eo-border)] pt-8">
          <button type="button" className="eo-btn-primary" onClick={onContinue} disabled={continueDisabled}>
            {continueLabel}
          </button>
        </div>
      )}
    </motion.section>
  );
}
