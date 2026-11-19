import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '../../..');
const FIX = join(HERE, '../fixtures');

export function loadUnifiedCatalog() {
  return JSON.parse(readFileSync(join(REPO, 'data/RHYME_DISCOVERY_CATALOG.json'), 'utf8'));
}

export function loadStringPanel() {
  return JSON.parse(readFileSync(join(FIX, 'string_panel.json'), 'utf8'));
}

export function loadNewCandidateWiring() {
  return JSON.parse(readFileSync(join(FIX, 'wiring_new_candidates.json'), 'utf8'));
}

export function loadOpenTargetsBridge() {
  return JSON.parse(readFileSync(join(FIX, 'opentargets_bridge_panel.json'), 'utf8'));
}

export function loadEuropePmc() {
  return JSON.parse(readFileSync(join(FIX, 'europepmc_comention.json'), 'utf8'));
}

export function loadChromosomeLoci() {
  return JSON.parse(readFileSync(join(FIX, 'chromosome_loci.json'), 'utf8'));
}

export function loadWetLabSupport() {
  return JSON.parse(readFileSync(join(FIX, 'wetlab_support_npy_pdx1.json'), 'utf8'));
}
