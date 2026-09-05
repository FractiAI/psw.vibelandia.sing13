/**
 * Lattice Chat Product Engineering Manual — living sync from engine shelf.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  AGENT_SYNC_FILE,
  LATTICE_CHAT_PEM_FILE,
  LATTICE_CHAT_PEM_ID,
  listEngineShelf,
  renderAgentSyncStackMarkdown,
  renderAgentSyncSuitesMarkdown,
  renderPemMetaMarkdown,
  renderPemShelfTableMarkdown,
} from './infinite-octave-engine-shelf.mjs';

export {
  AGENT_SYNC_FILE,
  LATTICE_CHAT_PEM_FILE,
  LATTICE_CHAT_PEM_ID,
} from './infinite-octave-engine-shelf.mjs';

const PEM_META_BEGIN = '<!-- AUTO:LATTICE-PEM-META:BEGIN -->';
const PEM_META_END = '<!-- AUTO:LATTICE-PEM-META:END -->';
const PEM_SHELF_BEGIN = '<!-- AUTO:LATTICE-PEM-ENGINE-SHELF:BEGIN -->';
const PEM_SHELF_END = '<!-- AUTO:LATTICE-PEM-ENGINE-SHELF:END -->';

const AGENT_STACK_BEGIN = '<!-- AUTO:ENGINE-SYNC-STACK:BEGIN -->';
const AGENT_STACK_END = '<!-- AUTO:ENGINE-SYNC-STACK:END -->';
const AGENT_SUITES_BEGIN = '<!-- AUTO:ENGINE-SYNC-SUITES:BEGIN -->';
const AGENT_SUITES_END = '<!-- AUTO:ENGINE-SYNC-SUITES:END -->';

function replaceMarkedBlock(source, begin, end, body, fileLabel) {
  const start = source.indexOf(begin);
  const stop = source.indexOf(end);
  if (start === -1 || stop === -1 || stop < start) {
    throw new Error(`Missing markers ${begin} … ${end} in ${fileLabel}`);
  }
  const before = source.slice(0, start + begin.length);
  const after = source.slice(stop);
  return `${before}\n${body.trim()}\n${after}`;
}

function bumpPemPublished(source, isoDate) {
  return source
    .replace(/(\*\*Date:\*\*\s*)[^\n]+/, `$1${isoDate}`)
    .replace(/(\*\*Published:\*\*\s*)[^\n]+/, `$1${isoDate}`);
}

/**
 * Rewrite AUTO blocks in the PEM + AGENT_SYNC from ENGINE_SHELF.
 */
export async function syncLatticeChatPem({ cwd = process.cwd(), now = new Date() } = {}) {
  const shelf = listEngineShelf(true);
  const iso = now.toISOString().slice(0, 10);

  const pemAbs = join(cwd, LATTICE_CHAT_PEM_FILE);
  let pem = await readFile(pemAbs, 'utf8');
  pem = replaceMarkedBlock(
    pem,
    PEM_META_BEGIN,
    PEM_META_END,
    renderPemMetaMarkdown(shelf, now),
    LATTICE_CHAT_PEM_FILE,
  );
  pem = replaceMarkedBlock(
    pem,
    PEM_SHELF_BEGIN,
    PEM_SHELF_END,
    renderPemShelfTableMarkdown(shelf),
    LATTICE_CHAT_PEM_FILE,
  );
  pem = bumpPemPublished(pem, iso);
  await writeFile(pemAbs, pem, 'utf8');

  const agentAbs = join(cwd, AGENT_SYNC_FILE);
  let agent = await readFile(agentAbs, 'utf8');
  agent = replaceMarkedBlock(
    agent,
    AGENT_STACK_BEGIN,
    AGENT_STACK_END,
    renderAgentSyncStackMarkdown(shelf),
    AGENT_SYNC_FILE,
  );
  agent = replaceMarkedBlock(
    agent,
    AGENT_SUITES_BEGIN,
    AGENT_SUITES_END,
    renderAgentSyncSuitesMarkdown(shelf),
    AGENT_SYNC_FILE,
  );
  await writeFile(agentAbs, agent, 'utf8');

  return {
    ok: true,
    file: LATTICE_CHAT_PEM_FILE,
    agentSync: AGENT_SYNC_FILE,
    pemId: LATTICE_CHAT_PEM_ID,
    count: shelf.length,
    registryCount: shelf.filter((e) => e.registryId).length,
    published: iso,
    ids: shelf.map((e) => e.registryId).filter(Boolean),
  };
}
