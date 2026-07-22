import type { LatticeModelOption } from '@/types';

/** Mirrors server FALLBACK_MODELS — full picker before / if live list is sparse. */
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
