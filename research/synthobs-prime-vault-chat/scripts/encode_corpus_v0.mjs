#!/usr/bin/env node
/**
 * Encode recursive protein library → data/prime-vault-corpus-v0.json
 * Grand narrative → holographic/magnetic/Goldilocks → Infinite Octaves → prime vaults → downstream.
 * Not LLM training — deterministic filing only ($0).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { encodeProteinLibrary } from '../../../lib/prime-vault-corpus-encode.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const encoded = encodeProteinLibrary({ root });
const outDir = join(root, 'data');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'prime-vault-corpus-v0.json');
const payload = {
  ...encoded,
  generatedAt: new Date().toISOString(),
};
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      ok: true,
      path: 'data/prime-vault-corpus-v0.json',
      nCells: encoded.nCells,
      nDocs: encoded.nDocs,
      metaProteins: encoded.metaProteins,
      missing: encoded.missing,
      trainingCostUsd: 0,
      note: 'Encode ≠ LLM training',
    },
    null,
    2,
  ),
);
