import { LATTICE_PROVIDERS, type LatticeProvider } from '@/lib/providerKeys';
import { catalogForProvider, mergeProviderModels } from '@/modelCatalog';
import type { AgentMode, LatticeModelOption, NestTopology } from '@/types';

const MODES: { id: AgentMode; label: string }[] = [
  { id: 'agent', label: 'Agent' },
  { id: 'plan', label: 'Plan' },
];

const NESTS: { id: NestTopology; label: string; title: string }[] = [
  {
    id: 'single',
    label: 'Single',
    title: 'One node only — lowest nest overhead / fewer estimated tokens',
  },
  {
    id: 'multi',
    label: 'Multi',
    title: 'Nested parent + children (or your explicit roster below)',
  },
  {
    id: 'goldilocks',
    label: 'Goldilocks',
    title: 'Auto: Lattice picks bands from the ask unless you define agents below',
  },
];

export function ComposerOptions({
  provider,
  mode,
  nestTopology,
  agentRoster,
  modelId,
  models,
  disabled,
  onProviderChange,
  onModeChange,
  onNestChange,
  onRosterChange,
  onModelChange,
}: {
  provider: LatticeProvider;
  mode: AgentMode;
  nestTopology: NestTopology;
  agentRoster: string;
  modelId: string;
  models: LatticeModelOption[];
  disabled?: boolean;
  onProviderChange: (provider: LatticeProvider) => void;
  onModeChange: (mode: AgentMode) => void;
  onNestChange: (nest: NestTopology) => void;
  onRosterChange: (roster: string) => void;
  onModelChange: (modelId: string) => void;
}) {
  const options =
    provider === 'cursor'
      ? mergeProviderModels('cursor', models)
      : catalogForProvider(provider);

  const showRoster = nestTopology === 'multi' || nestTopology === 'goldilocks';

  return (
    <div className="composer-options" role="group" aria-label="Agent options">
      <div className="composer-mode composer-provider" role="tablist" aria-label="Provider">
        {LATTICE_PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={provider === p.id}
            className={provider === p.id ? 'is-active' : undefined}
            disabled={disabled}
            title={p.honesty}
            onClick={() => onProviderChange(p.id)}
          >
            {p.short}
          </button>
        ))}
      </div>
      <div className="composer-mode" role="tablist" aria-label="Mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? 'is-active' : undefined}
            disabled={disabled || provider === 'gemini'}
            title={
              provider === 'gemini' ? 'Antigravity runs as a managed agent' : undefined
            }
            onClick={() => onModeChange(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="composer-mode" role="tablist" aria-label="Nest topology">
        {NESTS.map((n) => (
          <button
            key={n.id}
            type="button"
            role="tab"
            aria-selected={nestTopology === n.id}
            className={nestTopology === n.id ? 'is-active' : undefined}
            disabled={disabled}
            title={n.title}
            onClick={() => onNestChange(n.id)}
          >
            {n.label}
          </button>
        ))}
      </div>
      <label className="composer-model">
        <span className="sr-only">Model</span>
        <select
          value={options.some((o) => o.id === modelId) ? modelId : options[0]?.id}
          disabled={disabled}
          onChange={(e) => onModelChange(e.target.value)}
        >
          {options.map((m) => (
            <option key={m.id} value={m.id}>
              {m.displayName || m.id}
            </option>
          ))}
        </select>
      </label>
      {showRoster ? (
        <label className="composer-roster">
          <span className="composer-roster-label">
            Agents (optional) — one per line: <em>Name — role</em>. Empty = Goldilocks auto.
          </span>
          <textarea
            rows={2}
            disabled={disabled}
            spellCheck={false}
            placeholder={
              'Seed·RAG — docs/protocols pointers\nEdge UI — apps/interfaces\nPipe Runtime — api/lib'
            }
            value={agentRoster}
            onChange={(e) => onRosterChange(e.target.value)}
          />
        </label>
      ) : (
        <p className="composer-roster-hint">
          Single node: no nested children. Clearer and usually fewer estimated tokens.
        </p>
      )}
    </div>
  );
}
