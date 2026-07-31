import { useEffect, useState } from 'react';
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
    title: 'One node only — no nested children',
  },
  {
    id: 'multi',
    label: 'Multi',
    title: 'Nested parent + children (or your explicit roster)',
  },
  {
    id: 'goldilocks',
    label: 'Goldilocks',
    title: 'Auto: Lattice picks bands from the ask unless you define agents',
  },
];

const ADVANCED_KEY = 'lattice_composer_advanced_open';

function nestLabel(id: NestTopology): string {
  return NESTS.find((n) => n.id === id)?.label || id;
}

function modeLabel(id: AgentMode): string {
  return MODES.find((m) => m.id === id)?.label || id;
}

function providerShort(id: LatticeProvider): string {
  return LATTICE_PROVIDERS.find((p) => p.id === id)?.short || id;
}

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

  const canRoster = nestTopology === 'multi' || nestTopology === 'goldilocks';
  const [rosterOpen, setRosterOpen] = useState(() => Boolean(agentRoster.trim()));
  const [advancedOpen, setAdvancedOpen] = useState(() => {
    try {
      return sessionStorage.getItem(ADVANCED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(ADVANCED_KEY, advancedOpen ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [advancedOpen]);

  const modelName =
    options.find((o) => o.id === modelId)?.displayName ||
    options.find((o) => o.id === modelId)?.id ||
    modelId;
  const summary = `${providerShort(provider)} · ${modeLabel(mode)} · ${nestLabel(nestTopology)} · ${modelName}`;

  return (
    <div className="composer-options" role="group" aria-label="Steward options">
      <div className="composer-advanced-bar">
        <button
          type="button"
          className={`composer-advanced-toggle${advancedOpen ? ' is-open' : ''}`}
          aria-expanded={advancedOpen}
          disabled={disabled}
          onClick={() => setAdvancedOpen((v) => !v)}
        >
          {advancedOpen ? 'Hide options' : 'Advanced'}
        </button>
        {!advancedOpen ? (
          <p className="composer-summary" title={summary}>
            {summary}
          </p>
        ) : null}
      </div>

      {advancedOpen ? (
        <>
          <div className="composer-options-bar">
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
            {canRoster ? (
              <button
                type="button"
                className={`composer-roster-toggle${rosterOpen || agentRoster.trim() ? ' is-active' : ''}`}
                disabled={disabled}
                aria-expanded={rosterOpen}
                title="Optional agent roster"
                onClick={() => setRosterOpen((v) => !v)}
              >
                Crew{agentRoster.trim() ? ' ·' : ''}
              </button>
            ) : null}
          </div>
          {canRoster && rosterOpen ? (
            <label className="composer-roster">
              <span className="composer-roster-label">
                Optional crew — one per line: <em>Name — role</em>. Empty = Goldilocks auto.
              </span>
              <textarea
                rows={2}
                disabled={disabled}
                spellCheck={false}
                placeholder={
                  'Seed·RAG — docs/protocols pointers\nRecursive Attn Mag — docs/SYNTHOBS_RECURSIVE_ATTENTION_HOLOGRAPHIC_MAGNETIC_PROJECTIONS_2026-07.md\nOmni-Lattice Unification — docs/SYNTHOBS_OMNI_LATTICE_UNIFICATION_2026-07.md\nGenomic Determinism X — docs/SYNTHOBS_OMNI_LATTICE_GENOMIC_DETERMINISM_TERRITORY_2026-07.md\nPrompt Capture IX — docs/SYNTHOBS_OMNI_LATTICE_PROMPT_CAPTURE_DNA_2026-07.md\nY Chromosome Decode — docs/SYNTHOBS_Y_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md\nX Chromosome Decode — docs/SYNTHOBS_X_CHROMOSOME_HOLOGRAPHIC_OPERATOR_TRANSLATION_2026-07.md\nPogonomyrmex Omni-Lattice V — docs/SYNTHOBS_OMNI_LATTICE_POGONOMYRMEX_BARBATUS_2026-07.md\nProof by Continuous Execution — docs/SYNTHOBS_PROOF_BY_CONTINUOUS_EXECUTION_2026-07.md\nHIV Omni-Lattice III — docs/SYNTHOBS_OMNI_LATTICE_HIV_ADVERSARIAL_OPERATOR_2026-07.md\nThree Proteins Decode — docs/SYNTHOBS_THREE_FOUNDATIONAL_PROTEINS_HOLOGRAPHIC_2026-07.md\nHolographic Operators — docs/SYNTHOBS_HOLOGRAPHIC_OPERATORS_LANGUAGE_WIRING_2026-07.md\nUnified Neutronic Agent — docs/SYNTHOBS_UNIFIED_NEUTRONIC_AGENT_ISOTOPIC_LOAD_BALANCING_2026-07.md\nChemical Bond Metaphors — docs/SYNTHOBS_PHASE_LOCKED_CHEMICAL_BOND_METAPHORS_2026-07.md\n81-Digit Electrons — docs/SYNTHOBS_EGS_81_ELECTRONS_LATTICE_2026-07.md\nDNA Lattice Holograph — docs/SYNTHOBS_DNA_LATTICE_HOLOGRAPH_2026-07.md\nNested Lattice — docs/ARCHITECTURE_OMNIVERSAL_COMPUTING_NESTED_AGENT_LATTICE_2026-07.md\nEdge UI — apps/interfaces\nPipe Runtime — api/lib'
                }
                value={agentRoster}
                onChange={(e) => onRosterChange(e.target.value)}
              />
            </label>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
