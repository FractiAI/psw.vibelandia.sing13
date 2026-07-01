import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ModuleShell } from '../shell/CourseShell';
import { NewscastDeck } from '../newscast/NewscastDeck';
import { PracticeGateProvider } from '@/hooks/practiceGate';
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
  children: ReactNode;
}

const ADVANCE_MS = 1800;

export function ModuleTwoPhase({
  presentation,
  practiceTitle,
  practiceLead,
  onComplete,
  children,
  ...shell
}: Props) {
  const [phase, setPhase] = useState<'present' | 'practice'>('present');
  const [practiceReady, setPracticeReady] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const goToPractice = useCallback(() => {
    setPhase('practice');
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => {
    if (!practiceReady || phase !== 'practice') return;
    setAdvancing(true);
    const t = window.setTimeout(() => onComplete(), ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [practiceReady, phase, onComplete]);

  if (phase === 'present') {
    return (
      <ModuleShell {...shell} lead={shell.lead}>
        <PhasePill phase="present" minutes={presentation.presentationMinutes} />
        <NewscastDeck
          presentation={presentation}
          showTitle={shell.title}
          onBroadcastEnd={goToPractice}
        />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell {...shell} title={practiceTitle} lead={practiceLead}>
      <PhasePill phase="practice" />
      {advancing && (
        <p className="mb-4 text-sm text-accent">Practice complete — loading next module…</p>
      )}
      <PracticeGateProvider onReadyChange={setPracticeReady}>{children}</PracticeGateProvider>
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
        1 · Broadcast{minutes ? ` (~${minutes} min)` : ''}
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
