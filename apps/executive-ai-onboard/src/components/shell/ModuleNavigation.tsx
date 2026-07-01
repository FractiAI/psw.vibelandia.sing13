import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { COURSE_MODULES, moduleIndex, type ModuleId } from '@/content/course';
import { useCourseStore } from '@/store/courseStore';

/** Previous / next module controls + full module jump menu. */
export function ModuleNavigation({ variant = 'footer' }: { variant?: 'footer' | 'compact' }) {
  const current = useCourseStore((s) => s.currentModule);
  const progress = useCourseStore((s) => s.moduleProgress);
  const goTo = useCourseStore((s) => s.goToModule);
  const prevModule = useCourseStore((s) => s.prevModule);
  const nextModule = useCourseStore((s) => s.nextModule);
  const [menuOpen, setMenuOpen] = useState(false);

  const idx = moduleIndex(current);
  const prev = idx > 0 ? COURSE_MODULES[idx - 1] : null;
  const next = idx < COURSE_MODULES.length - 1 ? COURSE_MODULES[idx + 1] : null;

  const jump = (id: ModuleId) => {
    goTo(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (variant === 'compact') {
    return (
      <div className="relative flex items-center gap-1">
        <button
          type="button"
          className="eo-btn-ghost px-2 py-1.5 text-xs disabled:opacity-30"
          onClick={() => { prevModule(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={!prev}
          aria-label={prev ? `Previous: ${prev.title}` : 'No previous module'}
        >
          ←
        </button>
        <ModuleMenuButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} currentIdx={idx} />
        <button
          type="button"
          className="eo-btn-ghost px-2 py-1.5 text-xs disabled:opacity-30"
          onClick={() => { nextModule(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          disabled={!next}
          aria-label={next ? `Next: ${next.title}` : 'No next module'}
        >
          →
        </button>
        <ModuleJumpMenu open={menuOpen} current={current} progress={progress} onSelect={jump} onClose={() => setMenuOpen(false)} align="right" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {prev ? (
          <button
            type="button"
            className="eo-btn-outline text-sm"
            onClick={() => { prevModule(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            ← {prev.title}
          </button>
        ) : (
          <span />
        )}
        <div className="relative">
          <ModuleMenuButton open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} currentIdx={idx} label="All modules" />
          <ModuleJumpMenu open={menuOpen} current={current} progress={progress} onSelect={jump} onClose={() => setMenuOpen(false)} />
        </div>
        {next ? (
          <button
            type="button"
            className="eo-btn-ghost text-sm"
            onClick={() => { nextModule(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            {next.title} →
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function ModuleMenuButton({
  open,
  onToggle,
  currentIdx,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  currentIdx: number;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="eo-btn-ghost text-xs sm:text-sm"
      onClick={onToggle}
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      {label ?? `${currentIdx + 1}/${COURSE_MODULES.length}`}
    </button>
  );
}

function ModuleJumpMenu({
  open,
  current,
  progress,
  onSelect,
  onClose,
  align = 'right',
}: {
  open: boolean;
  current: ModuleId;
  progress: Partial<Record<ModuleId, { completed?: boolean }>>;
  onSelect: (id: ModuleId) => void;
  onClose: () => void;
  align?: 'left' | 'right';
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Close module menu" onClick={onClose} />
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="listbox"
            aria-label="Jump to module"
            className={`absolute z-50 mt-2 max-h-[min(320px,60vh)] w-[min(280px,calc(100vw-2rem))] overflow-auto rounded-xl border border-[var(--eo-border)] bg-surface-raised py-1 shadow-card ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            {COURSE_MODULES.map((m, i) => (
              <li key={m.id} role="option" aria-selected={m.id === current}>
                <button
                  type="button"
                  onClick={() => onSelect(m.id)}
                  className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-accent-soft ${
                    m.id === current ? 'bg-accent-soft font-semibold text-ink' : 'text-ink-muted'
                  }`}
                >
                  <span className="mt-0.5 w-5 shrink-0 text-xs text-ink-faint">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{m.title}</span>
                    {progress[m.id]?.completed && (
                      <span className="text-xs text-accent">Completed</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        </>
      )}
    </AnimatePresence>
  );
}
