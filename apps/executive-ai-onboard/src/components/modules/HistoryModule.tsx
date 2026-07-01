import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleTwoPhase } from '../presentation/ModuleTwoPhase';
import { MODULE_PRESENTATIONS } from '@/content/presentations';

const ERAS = [
  { id: 'symbolic', label: 'Symbolic AI', year: '1950s', desc: 'Logic, rules, expert systems' },
  { id: 'statistical', label: 'Statistical Learning', year: '1990s', desc: 'Probabilistic models from data' },
  { id: 'ml', label: 'Machine Learning', year: '2000s', desc: 'Algorithms that improve with experience' },
  { id: 'deep', label: 'Deep Learning', year: '2012+', desc: 'Multi-layer neural networks' },
  { id: 'transformer', label: 'Transformers', year: '2017', desc: 'Attention-based sequence modeling' },
  { id: 'foundation', label: 'Foundation Models', year: '2020s', desc: 'Large pre-trained general models' },
  { id: 'generative', label: 'Generative AI', year: 'Now', desc: 'Text, image, code, multimodal creation' },
];

const QUIZ = [
  { q: 'What unlocked modern language AI at scale?', options: ['Expert systems', 'Transformers + scale', 'Symbolic logic'], answer: 1 },
  { q: 'Which era emphasized hand-written rules?', options: ['Symbolic AI', 'Deep Learning', 'RAG'], answer: 0 },
  { q: 'What shifted competitive advantage from rules to data?', options: ['Expert systems maintenance', 'Statistical learning from examples', 'Manual ontologies only'], answer: 1 },
];

export function HistoryModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [placed, setPlaced] = useState<string[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const pool = ERAS.filter((e) => !placed.includes(e.id));
  const timelineFull = placed.length === ERAS.length;

  const placeNext = (id: string) => {
    setPlaced((prev) => [...prev, id]);
  };

  const answerQuiz = (idx: number) => {
    if (quizDone) return;
    if (idx === QUIZ[quizIdx].answer) setQuizScore((s) => s + 1);
    if (quizIdx < QUIZ.length - 1) setQuizIdx((i) => i + 1);
    else {
      setQuizDone(true);
      mark('m1-history');
    }
  };

  const presentation = MODULE_PRESENTATIONS['m1-history'];

  return (
    <ModuleTwoPhase
      presentation={presentation}
      kicker="Module 1"
      title="Why AI Looks the Way It Does"
      lead="A ~7 minute presentation on the seven-era arc, then a timeline and checkpoint quiz to lock it in."
      minutes={14}
      practiceTitle="Practice · AI history timeline"
      practiceLead="Build the timeline in order, then answer three checkpoint questions from the presentation."
      onComplete={() => complete('m1-history')}
      continueLabel="Unlock Module 2"
    >
      <div className="eo-card p-6">
        <p className="mb-4 text-sm font-medium text-ink">Timeline game · tap eras in chronological order</p>
        <div className="relative flex min-h-[120px] flex-wrap items-end gap-2 border-b-2 border-accent/40 pb-4">
          {placed.map((id) => {
            const era = ERAS.find((e) => e.id === id)!;
            return (
              <motion.div
                key={id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-lg bg-accent-soft px-3 py-2 text-center"
              >
                <p className="text-xs font-bold text-accent">{era.year}</p>
                <p className="text-xs text-ink-muted">{era.label}</p>
              </motion.div>
            );
          })}
          {placed.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-ink-faint">
              Tap milestones below to build the timeline →
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {pool.map((era) => (
            <button key={era.id} type="button" onClick={() => placeNext(era.id)} className="eo-btn-outline text-xs" title={era.desc}>
              {era.label}
            </button>
          ))}
        </div>
        {timelineFull && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm text-accent">
            Timeline complete — each era built on the last.
          </motion.p>
        )}
      </div>

      {timelineFull && (
        <div className="eo-card p-6">
          <p className="text-sm font-medium text-ink">Checkpoint quiz · {quizIdx + 1} of {QUIZ.length}</p>
          {!quizDone ? (
            <>
              <p className="mt-3 text-ink-muted">{QUIZ[quizIdx].q}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {QUIZ[quizIdx].options.map((opt, i) => (
                  <button key={opt} type="button" className="eo-btn-outline text-sm" onClick={() => answerQuiz(i)}>
                    {opt}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">
              Score: {quizScore}/{QUIZ.length} — {quizScore >= 2 ? 'Ready to continue.' : 'Review the presentation and retry.'}
            </p>
          )}
        </div>
      )}
    </ModuleTwoPhase>
  );
}
