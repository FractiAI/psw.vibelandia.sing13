import { motion, AnimatePresence } from 'framer-motion';
import { NewscastAnchor } from './NewscastAnchor';
import { usePlayerKeyboard } from '@/hooks/usePlayerKeyboard';
import type { NewscastNarration } from '@/hooks/useNewscastNarration';

interface Props {
  showTitle: string;
  minutes: number;
  narration: NewscastNarration;
}

const MODE_LABEL = {
  neural: 'Neural voice',
  browser: 'Browser voice',
  idle: 'Starting…',
} as const;

export function NewscastStage({ showTitle, minutes, narration }: Props) {
  const {
    current,
    index,
    segments,
    progress,
    broadcast,
    ttsMode,
    error,
    resume,
    togglePlayPause,
    next,
    prev,
    isSpeaking,
  } = narration;

  const isPaused = broadcast === 'paused';
  const isEnded = broadcast === 'ended';
  const isStarting = broadcast === 'idle';

  usePlayerKeyboard({
    onPlayPause: togglePlayPause,
    onPrev: prev,
    onNext: next,
    enabled: true,
  });

  return (
    <section className="newscast-stage eo-card overflow-hidden border-[#1e3a5f]/30" aria-label="Executive briefing broadcast">
      <div className="newscast-header flex flex-wrap items-center justify-between gap-3 border-b border-[var(--eo-border)] bg-[#0f172a] px-4 py-3 text-white">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[#93c5fd]">Executive AI Briefing</p>
          <h2 className="mt-0.5 text-base font-semibold sm:text-lg">{showTitle}</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/70">
          <span>~{minutes} min</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5">{MODE_LABEL[ttsMode]}</span>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="border-b border-[var(--eo-border)] p-4 lg:border-b-0 lg:border-r">
          <NewscastAnchor speaking={isSpeaking} />
        </div>

        <div className="flex min-h-[220px] flex-col justify-between bg-surface p-4 sm:p-5">
          <div className="flex-1">
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-accent">
              Segment {index + 1} of {segments.length}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-2"
              >
                <p className="text-lg font-semibold text-ink">{current?.headline}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">{current?.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="newscast-lower-third mt-4">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/80">On the record</p>
            <p className="mt-0.5 text-sm font-medium text-white">{current?.headline}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--eo-border)] bg-surface-raised px-4 py-3">
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-accent-soft">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {error && <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">{error}</p>}

        {isStarting && !error && (
          <p className="mb-2 text-xs text-ink-faint">Anchor coming on air…</p>
        )}

        {isEnded && (
          <p className="mb-2 text-xs text-accent">Broadcast complete — practice quiz loads automatically.</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="eo-btn-primary min-w-[7rem]"
            onClick={togglePlayPause}
            aria-label={isSpeaking ? 'Pause' : isPaused ? 'Resume' : isEnded ? 'Replay' : 'Play'}
          >
            {isSpeaking ? '⏸ Pause' : isEnded ? '↺ Replay' : '▶ Play'}
          </button>

          <button type="button" className="eo-btn-ghost px-3" onClick={prev} disabled={index === 0} aria-label="Previous segment">
            ←
          </button>
          <button
            type="button"
            className="eo-btn-ghost px-3"
            onClick={next}
            disabled={index >= segments.length - 1}
            aria-label="Next segment"
          >
            →
          </button>

          {isPaused && (
            <button type="button" className="eo-btn-outline text-xs" onClick={resume}>
              Resume
            </button>
          )}

          <p className="ml-auto hidden text-[0.65rem] text-ink-faint sm:block">
            Space · play/pause · ← → · skip
          </p>
        </div>
      </div>
    </section>
  );
}
