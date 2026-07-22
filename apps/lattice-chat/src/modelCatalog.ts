import type { LatticeModelOption } from '@/types';

/** Operator-paid path: Auto only (Cursor resolves the model). */
export const LATTICE_MODEL_CATALOG: LatticeModelOption[] = [
  { id: 'auto', displayName: 'Auto' },
];

export function mergeLatticeModels(_live: LatticeModelOption[]): LatticeModelOption[] {
  return [...LATTICE_MODEL_CATALOG];
}
