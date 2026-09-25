#!/usr/bin/env node
/**
 * Write durable agent status so background chat replies cannot vanish silently.
 *
 * Usage:
 *   node scripts/write-agent-status.mjs --state=in_progress --task="ERFT V1" --summary="Building suite"
 *   node scripts/write-agent-status.mjs --state=done --task="ERFT V1" --summary="Shipped to main"
 */
import { writeAgentStatus } from '../lib/lattice-agent-status.mjs';

function arg(name, fallback = '') {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function listArg(name) {
  const raw = arg(name, '');
  if (!raw) return undefined;
  return raw.split('|').map((s) => s.trim()).filter(Boolean);
}

const state = arg('state', 'in_progress');
const task = arg('task', 'unspecified');
const status = writeAgentStatus({
  state,
  task,
  summary: arg('summary'),
  branch: arg('branch'),
  prUrl: arg('prUrl'),
  commit: arg('commit'),
  done: listArg('done'),
  next: listArg('next'),
});

console.log(JSON.stringify({ ok: true, path: 'data/lattice-agent-status.json', status }, null, 2));
