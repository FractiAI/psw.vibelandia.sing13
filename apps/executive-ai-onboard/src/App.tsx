import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { usePageViews } from '@/hooks/usePageViews';
import type { ModuleId } from '@/content/course';
import { ProgressRail, TutorSidebar, GlossaryPanel, ThemeToggle } from '@/components/shell/CourseShell';
import { WelcomeModule } from '@/components/modules/WelcomeModule';
import { HistoryModule } from '@/components/modules/HistoryModule';
import { StackModule } from '@/components/modules/StackModule';
import { MLModule } from '@/components/modules/MLModule';
import { TradeoffsModule } from '@/components/modules/TradeoffsModule';
import { FractalHoloModule } from '@/components/modules/FractalHoloModule';
import { CompareModule } from '@/components/modules/CompareModule';
import { ThreeAxesModule } from '@/components/modules/ThreeAxesModule';
import { EnterpriseModule } from '@/components/modules/EnterpriseModule';
import { CompletionModule } from '@/components/modules/CompletionModule';

const TUTOR_HINTS: Record<ModuleId, string> = {
  welcome: 'Choose the lens that matches your role. Explanations adapt; the curriculum does not.',
  'm1-history': 'Order matters. Each AI era enabled the next breakthrough.',
  'm2-stack': 'Explore every layer before continuing — the stack is only as strong as its weakest link.',
  'm3-ml': 'Watch loss decrease as epochs run. High learning rates can overshoot.',
  'm4-tradeoffs': 'Flag at least two bottlenecks per scenario for leadership-ready analysis.',
  'm5-fractal-holo': 'Fractal = recursive scale. Holographic = whole encoded in parts. Both are proposals here.',
  'm6-compare': 'Open every comparison row. Note what is operational today vs conceptual.',
  'm7-axes': 'Inspect all three layers. Emergence sits at their intersection.',
  'm8-enterprise': 'Distinguish current capability from forward-looking concept on every card.',
  completion: 'You have the mental model. Use it in strategy, planning, and vendor conversations.',
};

function ModuleView({ id }: { id: ModuleId }) {
  switch (id) {
    case 'welcome':
      return <WelcomeModule />;
    case 'm1-history':
      return <HistoryModule />;
    case 'm2-stack':
      return <StackModule />;
    case 'm3-ml':
      return <MLModule />;
    case 'm4-tradeoffs':
      return <TradeoffsModule />;
    case 'm5-fractal-holo':
      return <FractalHoloModule />;
    case 'm6-compare':
      return <CompareModule />;
    case 'm7-axes':
      return <ThreeAxesModule />;
    case 'm8-enterprise':
      return <EnterpriseModule />;
    case 'completion':
      return <CompletionModule />;
    default:
      return null;
  }
}

export default function App() {
  const current = useCourseStore((s) => s.currentModule);
  usePageViews(current);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [current]);

  return (
    <div className="min-h-dvh bg-surface bg-[var(--eo-gradient)]">
      <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
        <a
          href="/executive-onboarding"
          className="hidden sm:inline eo-btn-ghost text-xs py-1.5 px-3"
        >
          ← Hub
        </a>
        <ThemeToggle />
      </div>
      <ProgressRail />
      <main>
        <AnimatePresence mode="wait">
          <ModuleView key={current} id={current} />
        </AnimatePresence>
      </main>
      <TutorSidebar hint={TUTOR_HINTS[current]} />
      <GlossaryPanel />
    </div>
  );
}
