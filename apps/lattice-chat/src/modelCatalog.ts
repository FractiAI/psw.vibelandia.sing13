import type { LatticeProvider } from '@/lib/providerKeys';
import type { LatticeModelOption } from '@/types';

/** Cursor picker catalog; live Cursor.models.list merges on top when available. */
export const LATTICE_MODEL_CATALOG: LatticeModelOption[] = [
  { id: 'auto', displayName: 'Auto' },
  { id: 'composer-2.5', displayName: 'Composer 2.5' },
  { id: 'composer-2', displayName: 'Composer 2' },
  { id: 'composer-2.5-fast', displayName: 'Composer 2.5 Fast' },
  { id: 'gpt-5.6-sol-medium', displayName: 'GPT-5.6 Sol' },
  { id: 'gpt-5.6-terra-medium', displayName: 'GPT-5.6 Terra' },
  { id: 'gpt-5.5', displayName: 'GPT-5.5' },
  { id: 'gpt-5.2', displayName: 'GPT-5.2' },
  { id: 'claude-opus-4-8-thinking-high', displayName: 'Claude Opus 4.8 Thinking' },
  { id: 'claude-sonnet-5-thinking-high', displayName: 'Claude Sonnet 5 Thinking' },
  { id: 'claude-fable-5-thinking-high', displayName: 'Claude Fable 5 Thinking' },
  { id: 'claude-4.6-sonnet-thinking', displayName: 'Claude 4.6 Sonnet Thinking' },
  { id: 'claude-4.5-sonnet', displayName: 'Claude 4.5 Sonnet' },
  { id: 'claude-opus-4-7', displayName: 'Claude Opus 4.7' },
  { id: 'cursor-grok-4.5-high-fast', displayName: 'Grok 4.5 Fast' },
];

export const CLAUDE_MODEL_CATALOG: LatticeModelOption[] = [
  { id: 'claude-sonnet-4-5', displayName: 'Claude Sonnet 4.5' },
  { id: 'claude-opus-4', displayName: 'Claude Opus 4' },
  { id: 'claude-haiku-4-5', displayName: 'Claude Haiku 4.5' },
  { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4' },
  { id: 'claude-3-5-haiku-latest', displayName: 'Claude 3.5 Haiku' },
];

export const GEMINI_MODEL_CATALOG: LatticeModelOption[] = [
  {
    id: 'antigravity-preview-05-2026',
    displayName: 'Antigravity (managed)',
    description: 'Google-hosted Antigravity agent sandbox',
  },
];

export const OPENROUTER_MODEL_CATALOG: LatticeModelOption[] = [
  { id: 'deepseek/deepseek-chat', displayName: 'DeepSeek Chat' },
  { id: 'deepseek/deepseek-r1', displayName: 'DeepSeek R1' },
  { id: 'openai/gpt-4o-mini', displayName: 'GPT-4o Mini' },
  { id: 'openai/gpt-4o', displayName: 'GPT-4o' },
  { id: 'anthropic/claude-sonnet-4', displayName: 'Claude Sonnet 4 (OpenRouter)' },
  { id: 'google/gemini-2.0-flash-001', displayName: 'Gemini 2.0 Flash' },
  { id: 'meta-llama/llama-3.3-70b-instruct', displayName: 'Llama 3.3 70B' },
];

export const PROVIDER_DEFAULT_MODEL: Record<LatticeProvider, string> = {
  cursor: 'composer-2.5',
  openrouter: 'deepseek/deepseek-chat',
  claude: 'claude-sonnet-4-5',
  gemini: 'antigravity-preview-05-2026',
};

export function catalogForProvider(provider: LatticeProvider): LatticeModelOption[] {
  if (provider === 'claude') return CLAUDE_MODEL_CATALOG;
  if (provider === 'gemini') return GEMINI_MODEL_CATALOG;
  if (provider === 'openrouter') return OPENROUTER_MODEL_CATALOG;
  return LATTICE_MODEL_CATALOG;
}

export function mergeLatticeModels(live: LatticeModelOption[]): LatticeModelOption[] {
  const byId = new Map<string, LatticeModelOption>();
  for (const m of LATTICE_MODEL_CATALOG) byId.set(m.id, { ...m });
  for (const m of live) {
    const id = String(m.id || '').trim();
    if (!id) continue;
    const prev = byId.get(id);
    byId.set(id, {
      id,
      displayName: m.displayName || prev?.displayName || id,
      description: m.description || prev?.description,
    });
  }
  return [...byId.values()];
}

export function mergeProviderModels(
  provider: LatticeProvider,
  live: LatticeModelOption[],
): LatticeModelOption[] {
  if (provider === 'cursor') return mergeLatticeModels(live);
  const base = catalogForProvider(provider);
  if (!live.length) return base;
  const byId = new Map<string, LatticeModelOption>();
  for (const m of base) byId.set(m.id, { ...m });
  for (const m of live) {
    const id = String(m.id || '').trim();
    if (!id) continue;
    const prev = byId.get(id);
    byId.set(id, {
      id,
      displayName: m.displayName || prev?.displayName || id,
      description: m.description || prev?.description,
    });
  }
  return [...byId.values()];
}
