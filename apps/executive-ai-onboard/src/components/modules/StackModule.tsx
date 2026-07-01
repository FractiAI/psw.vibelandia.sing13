import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseStore } from '@/store/courseStore';
import { ModuleShell } from '../shell/CourseShell';

const LAYERS = [
  { id: 'data', label: 'Data Sources', detail: 'Structured DBs, documents, APIs, sensors, web crawls', example: 'Customer records + support tickets + product docs' },
  { id: 'storage', label: 'Storage', detail: 'Data lakes, warehouses, object storage (S3, GCS)', example: 'Snowflake + S3 raw zone' },
  { id: 'pipelines', label: 'Data Pipelines', detail: 'ETL/ELT, streaming (Kafka), orchestration (Airflow)', example: 'Nightly sync → cleaned feature tables' },
  { id: 'features', label: 'Feature Engineering', detail: 'Transform raw data into model-ready signals', example: 'Embeddings, aggregations, normalization' },
  { id: 'training', label: 'Training', detail: 'GPU/TPU clusters, distributed compute, hyperparameter search', example: 'Weeks on H100 pods for foundation models' },
  { id: 'foundation', label: 'Foundation Models', detail: 'GPT, Claude, Gemini, Llama — pre-trained at scale', example: 'General reasoning + domain fine-tunes' },
  { id: 'inference', label: 'Inference', detail: 'Serving APIs, batch jobs, edge deployment', example: 'OpenAI API, vLLM, TensorRT' },
  { id: 'apps', label: 'Applications', detail: 'RAG, agents, MCP tools, memory, fine-tuning layers', example: 'Copilot, support bot, code assistant' },
];

export function StackModule() {
  const complete = useCourseStore((s) => s.completeModule);
  const mark = useCourseStore((s) => s.markCheckpoint);
  const [explored, setExplored] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);

  const explore = (id: string) => {
    const next = new Set(explored).add(id);
    setExplored(next);
    setActive(id);
    if (next.size === LAYERS.length) mark('m2-stack');
  };

  const layer = LAYERS.find((l) => l.id === active);

  return (
    <ModuleShell
      kicker="Module 2"
      title="Today's AI Technology Stack"
      lead="Click every layer to expand the architecture. Real products sit at the top; everything below is infrastructure."
      minutes={8}
      onContinue={() => complete('m2-stack')}
      continueDisabled={explored.size < LAYERS.length}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-1">
          {LAYERS.map((l, i) => (
            <motion.button
              key={l.id}
              type="button"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => explore(l.id)}
              className={`w-full max-w-xs rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                explored.has(l.id)
                  ? 'border-accent bg-accent-soft text-ink'
                  : 'border-[var(--eo-border)] bg-surface-raised text-ink-muted hover:border-accent/50'
              } ${active === l.id ? 'ring-2 ring-accent' : ''}`}
            >
              <span className="font-semibold">{l.label}</span>
              {explored.has(l.id) && <span className="ml-2 text-accent">✓</span>}
              {i < LAYERS.length - 1 && (
                <span className="mx-auto mt-1 block text-center text-ink-faint">↓</span>
              )}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          {layer ? (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="eo-card p-6"
            >
              <p className="eo-kicker">Deep dive</p>
              <h3 className="mt-2 text-xl font-semibold text-ink">{layer.label}</h3>
              <p className="mt-3 text-sm text-ink-muted">{layer.detail}</p>
              <p className="mt-4 rounded-lg bg-accent-soft p-3 text-xs text-ink-muted">
                <strong className="text-ink">Example:</strong> {layer.example}
              </p>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center eo-card p-6 text-sm text-ink-faint">
              Select a layer to explore →
            </div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs text-ink-faint">
        {explored.size}/{LAYERS.length} layers explored
      </p>
    </ModuleShell>
  );
}
