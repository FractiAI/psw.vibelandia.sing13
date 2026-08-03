#!/usr/bin/env node
/**
 * Cursor hook · keep README + interfaces/index.html listing fresh.
 * afterFileEdit / stop: if any interfaces HTML page (non-assets/partials) was touched, resync both.
 */
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  syncInterfacesIndex,
  isInterfacesHtmlRel,
} from '../../lib/interfaces-readme-index.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');

function normalizeRel(filePath, workspaceRoots = []) {
  const abs = resolve(filePath);
  const root =
    workspaceRoots.map((r) => resolve(r)).find((r) => abs.startsWith(r + '/') || abs.startsWith(r + '\\')) ||
    REPO_ROOT;
  return relative(root, abs).replace(/\\/g, '/');
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const payload = JSON.parse(raw || '{}');
  const event = payload.hook_event_name;

  let shouldSync = false;

  if (event === 'afterFileEdit' && payload.file_path) {
    const rel = normalizeRel(payload.file_path, payload.workspace_roots);
    shouldSync = isInterfacesHtmlRel(rel);
  } else if (event === 'stop' && payload.status === 'completed') {
    // Always refresh on stop — cheap scan; keeps listing honest after batch HTML edits.
    shouldSync = true;
  }

  if (!shouldSync) {
    process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    return;
  }

  try {
    const result = await syncInterfacesIndex({ cwd: REPO_ROOT });
    console.error(
      JSON.stringify({
        hook: 'interfaces-readme-index',
        ...result,
      }),
    );
  } catch (e) {
    console.error(
      JSON.stringify({
        hook: 'interfaces-readme-index',
        ok: false,
        error: e.message,
      }),
    );
  }

  process.stdout.write(JSON.stringify({ continue: true }) + '\n');
}

main().catch((e) => {
  console.error(e);
  process.stdout.write(JSON.stringify({ continue: true }) + '\n');
  process.exit(0);
});
