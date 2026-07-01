import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LearnerPath, ModuleId } from '@/content/course';
import { COURSE_MODULES } from '@/content/course';

const MODULE_ORDER = COURSE_MODULES.map((m) => m.id);

interface ModuleProgress {
  completed: boolean;
  checkpointPassed: boolean;
}

interface CourseState {
  learnerPath: LearnerPath | null;
  currentModule: ModuleId;
  moduleProgress: Partial<Record<ModuleId, ModuleProgress>>;
  startedAt: string | null;
  completedAt: string | null;
  theme: 'dark' | 'light';
  tutorOpen: boolean;
  glossaryOpen: boolean;
  setLearnerPath: (path: LearnerPath) => void;
  goToModule: (id: ModuleId) => void;
  nextModule: () => void;
  markCheckpoint: (id: ModuleId) => void;
  completeModule: (id: ModuleId) => void;
  resetCourse: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTutor: () => void;
  toggleGlossary: () => void;
  progressPercent: () => number;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      learnerPath: null,
      currentModule: 'welcome',
      moduleProgress: {},
      startedAt: null,
      completedAt: null,
      theme: 'dark',
      tutorOpen: false,
      glossaryOpen: false,

      setLearnerPath: (path) =>
        set({ learnerPath: path, startedAt: get().startedAt ?? new Date().toISOString() }),

      goToModule: (id) => set({ currentModule: id }),

      nextModule: () => {
        const idx = MODULE_ORDER.indexOf(get().currentModule);
        if (idx < MODULE_ORDER.length - 1) {
          set({ currentModule: MODULE_ORDER[idx + 1] });
        }
      },

      markCheckpoint: (id) =>
        set((s) => ({
          moduleProgress: {
            ...s.moduleProgress,
            [id]: { ...s.moduleProgress[id], checkpointPassed: true, completed: s.moduleProgress[id]?.completed ?? false },
          },
        })),

      completeModule: (id) => {
        const isLast = id === 'completion';
        set((s) => ({
          moduleProgress: {
            ...s.moduleProgress,
            [id]: { completed: true, checkpointPassed: true },
          },
          completedAt: isLast ? new Date().toISOString() : s.completedAt,
        }));
        if (!isLast) get().nextModule();
      },

      resetCourse: () =>
        set({
          learnerPath: null,
          currentModule: 'welcome',
          moduleProgress: {},
          startedAt: null,
          completedAt: null,
        }),

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('eo-theme', theme);
        set({ theme });
      },

      toggleTutor: () => set((s) => ({ tutorOpen: !s.tutorOpen })),
      toggleGlossary: () => set((s) => ({ glossaryOpen: !s.glossaryOpen })),

      progressPercent: () => {
        const done = Object.values(get().moduleProgress).filter((p) => p?.completed).length;
        return Math.round((done / MODULE_ORDER.length) * 100);
      },
    }),
    { name: 'eo-course-progress-v1' },
  ),
);

export function pathTone(path: LearnerPath | null): 'strategic' | 'technical' | 'balanced' {
  if (path === 'executive') return 'strategic';
  if (path === 'technical' || path === 'familiar') return 'technical';
  return 'balanced';
}
