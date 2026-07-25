import { LATTICE_PROVIDERS, type LatticeProvider } from '@/lib/providerKeys';
import { catalogForProvider, mergeProviderModels } from '@/modelCatalog';
import type { AgentMode, LatticeModelOption } from '@/types';

const MODES: { id: AgentMode; label: string }[] = [
  { id: 'agent', label: 'Agent' },
  { id: 'plan', label: 'Plan' },
];

export function ComposerOptions({
  provider,
  mode,
  modelId,
  models,
  disabled,
  onProviderChange,
  onModeChange,
  onModelChange,
}: {
  provider: LatticeProvider;
  mode: AgentMode;
  modelId: string;
  models: LatticeModelOption[];
  disabled?: boolean;
  onProviderChange: (provider: LatticeProvider) => void;
  onModeChange: (mode: AgentMode) => void;
  onModelChange: (modelId: string) => void;
}) {
  const options =
    provider === 'cursor'
      ? mergeProviderModels('cursor', models)
      : catalogForProvider(provider);

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
    </div>
  );
}
