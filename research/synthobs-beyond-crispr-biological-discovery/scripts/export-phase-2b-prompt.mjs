#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportPhase2bBundle } from '../src/phase-2b-lattice.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'data');

async function main() {
  const bundle = exportPhase2bBundle();
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'phase_2b_lattice_prompt.txt'), bundle.prompt);
  await fs.writeFile(
    path.join(OUT, 'phase_2b_receipt.template.json'),
    JSON.stringify(bundle.receiptTemplate, null, 2),
  );
  const summary = {
    ok: bundle.audit.pass,
    audit: bundle.audit,
    latticeChatUrl: bundle.latticeChatUrl,
    files: ['data/phase_2b_lattice_prompt.txt', 'data/phase_2b_receipt.template.json'],
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!bundle.audit.pass) process.exit(1);
}

main();
