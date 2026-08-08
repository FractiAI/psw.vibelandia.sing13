#!/usr/bin/env node
/**
 * Sync living TOC for Lattice Chat Agent · Omni-Lattice complete layer guide.
 * Also bumps registry `published` so the catalog stamp stays current.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LATTICE_OMNI_GUIDE_ID,
  syncLatticeOmniLayerGuide,
} from '../lib/lattice-omni-guide.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = join(ROOT, 'lib/whitepaper-registry.mjs');

async function bumpRegistryPublished(isoDate) {
  let src = await readFile(REGISTRY_PATH, 'utf8');
  const blockRe = new RegExp(
    `('${LATTICE_OMNI_GUIDE_ID}'\\s*:\\s*\\{[\\s\\S]*?published:\\s*')\\d{4}-\\d{2}-\\d{2}(')`,
  );
  if (!blockRe.test(src)) {
    throw new Error(`Registry entry ${LATTICE_OMNI_GUIDE_ID} missing or has no published field`);
  }
  src = src.replace(blockRe, `$1${isoDate}$2`);
  await writeFile(REGISTRY_PATH, src, 'utf8');
}

async function main() {
  const result = await syncLatticeOmniLayerGuide({ cwd: ROOT });
  await bumpRegistryPublished(result.published);
  console.log(
    JSON.stringify(
      {
        ok: true,
        ...result,
        registryPublishedBumped: true,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
