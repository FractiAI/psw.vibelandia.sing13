import { LATTICE_MODEL_CATALOG } from '@/modelCatalog';
import type { AgentMode, LatticeModelOption } from '@/types';

const MODES: { id: AgentMode; label: string }[] = [
  { id: 'agent', label: 'Agent' },
  { id: 'plan', label: 'Plan' },
];

export function ComposerOptions({
  mode,
  modelId,
  models,
  disabled,
  onModeChange,
  onModelChange,
}: {
  mode: AgentMode;
  modelId: string;
  models: LatticeModelOption[];
  disabled?: boolean;
  onModeChange: (mode: AgentMode) => void;
  onModelChange: (modelId: string) => void;
}) {
  const options = models.length > 1 ? models : LATTICE_MODEL_CATALOG;

  return (
    <div className="composer-options" role="group" aria-label="Agent options">
      <div className="composer-mode" role="tablist" aria-label="Mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={mode === m.id ? 'is-active' : undefined}
            disabled={disabled}
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
