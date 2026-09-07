#!/usr/bin/env node
/**
 * Encode Official Prospectus → data/prime-vault-corpus-v0.json for Miracle 2 Seed layer.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import {
  encodeCorpusToCells,
  DEFAULT_CORPUS_SOURCE,
} from '../../../lib/prime-vault-corpus-encode.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const md = readFileSync(join(root, DEFAULT_CORPUS_SOURCE), 'utf8');
const encoded = encodeCorpusToCells(md, {
  source: DEFAULT_CORPUS_SOURCE,
  maxCells: 16,
  maxSpeak: 320,
});
const outDir = join(root, 'data');
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'prime-vault-corpus-v0.json');
const payload = {
  ...encoded,
  generatedAt: new Date().toISOString(),
  honesty:
    'Corpus encode v0 — auto-filed prospectus sections as prime vaults. Catalog/narrative coverage only; not open-world LLM parity; $0 training.',
};
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  JSON.stringify(
    { ok: true, path: 'data/prime-vault-corpus-v0.json', nCells: encoded.nCells, source: encoded.source },
    null,
    2,
  ),
);
