/**
 * Durable Lattice / Cloud Agent status receipt.
 * Survives missing background chat replies — Player 1 can always check
 * data/lattice-agent-status.json or GET /api/lattice-agent-status.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
export const AGENT_STATUS_PATH = path.join(ROOT, 'data', 'lattice-agent-status.json');
export const AGENT_STATUS_SCHEMA = 'lattice-agent-status/v1';

/**
 * @typedef {object} LatticeAgentStatus
 * @property {string} schema
 * @property {string} updatedAt
 * @property {'idle'|'in_progress'|'blocked'|'done'|'failed'} state
 * @property {string} task
 * @property {string} [summary]
 * @property {string} [branch]
 * @property {string} [prUrl]
 * @property {string} [commit]
 * @property {string[]} [done]
 * @property {string[]} [next]
 * @property {string} [operator]
 */

/**
 * @param {Partial<LatticeAgentStatus> & { state: LatticeAgentStatus['state'], task: string }} patch
 * @returns {LatticeAgentStatus}
 */
export function writeAgentStatus(patch) {
  const prev = readAgentStatus() || {};
  const next = {
    schema: AGENT_STATUS_SCHEMA,
    updatedAt: new Date().toISOString(),
    state: patch.state,
    task: patch.task,
    summary: patch.summary ?? prev.summary ?? '',
    branch: patch.branch ?? prev.branch ?? '',
    prUrl: patch.prUrl ?? prev.prUrl ?? '',
    commit: patch.commit ?? prev.commit ?? '',
    done: patch.done ?? prev.done ?? [],
    next: patch.next ?? prev.next ?? [],
    operator: patch.operator ?? 'SynthOBS Autonomous Agent · Syntheverse Sandbox · Lattice Chat',
  };
  fs.mkdirSync(path.dirname(AGENT_STATUS_PATH), { recursive: true });
  fs.writeFileSync(AGENT_STATUS_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

/** @returns {LatticeAgentStatus | null} */
export function readAgentStatus() {
  try {
    if (!fs.existsSync(AGENT_STATUS_PATH)) return null;
    return JSON.parse(fs.readFileSync(AGENT_STATUS_PATH, 'utf8'));
  } catch {
    return null;
  }
}
