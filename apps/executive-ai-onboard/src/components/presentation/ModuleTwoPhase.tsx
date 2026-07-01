import { useState, type ReactNode } from 'react';
import { ModuleShell } from '../shell/CourseShell';
import { PresentationDeck } from './PresentationDeck';
import type { ModulePresentation } from '@/content/presentations';

interface ShellProps {
  kicker: string;
  title: string;
  lead: string;
  minutes: number;
}

interface Props extends ShellProps {
  presentation: ModulePresentation;
  practiceTitle: string;
  practiceLead: string;
  onComplete: () => void;
  continueLabel?: string;
  children: ReactNode;
}

export function ModuleTwoPhase({
  presentation,
  practiceTitle,
  practiceLead,
  onComplete,
  continueLabel = 'Continue to next module',
  children,
  ...shell
}: Props) {
  const [phase, setPhase] = useState<'present' | 'practice'>('present');

  if (phase === 'present') {
    return (
      <ModuleShell
        {...shell}
        lead={shell.lead}
        onContinue={() => setPhase('practice')}
        continueLabel="Start practice quiz →"
      >
        <PhasePill phase="present" minutes={presentation.presentationMinutes} />
        <PresentationDeck presentation={presentation} />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      {...shell}
      title={practiceTitle}
      lead={practiceLead}
      onContinue={onComplete}
      continueLabel={continueLabel}
    >
      <PhasePill phase="practice" />
      <div className="mb-6 flex gap-2">
        <button type="button" className="eo-btn-ghost text-xs" onClick={() => setPhase('present')}>
          ← Back to presentation
        </button>
      </div>
      {children}
    </ModuleShell>
  );
}

function PhasePill({ phase, minutes }: { phase: 'present' | 'practice'; minutes?: number }) {
  return (
    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--eo-border)] bg-surface-raised px-3 py-1.5 text-xs">
      <span
        className={`rounded-full px-2 py-0.5 font-semibold ${
          phase === 'present' ? 'bg-accent text-white' : 'text-ink-faint'
        }`}
      >
        1 · Presentation{minutes ? ` (~${minutes} min)` : ''}
      </span>
      <span className="text-ink-faint">→</span>
      <span
        className={`rounded-full px-2 py-0.5 font-semibold ${
          phase === 'practice' ? 'bg-accent text-white' : 'text-ink-faint'
        }`}
      >
        2 · Practice quiz
      </span>
    </div>
  );
}
