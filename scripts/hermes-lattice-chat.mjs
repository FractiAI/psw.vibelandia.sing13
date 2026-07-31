#!/usr/bin/env node
/**
 * Hermes Lattice Chat CLI — talk to the Lattice Chat V1.618 API from the terminal.
 *
 * Usage:
 *   node scripts/hermes-lattice-chat.mjs --prompt "What is NSPFRNP?"
 *   echo "Explain the EGS fractal constant" | node scripts/hermes-lattice-chat.mjs
 *
 * Environment (all optional for dry-run):
 *   LATTICE_CHAT_ENDPOINT  Default: https://www.ssvibelandiaquestfest24x365.com
 *   LATTICE_CHAT_EMAIL     Your email (must be in the Lattice access list)
 *   LATTICE_CHAT_API_KEY   Provider API key (Cursor / Anthropic / Gemini / OpenRouter)
 *   LATTICE_CHAT_PROVIDER  Default: cursor
 *   LATTICE_CHAT_MODEL     Default: auto (Cursor) / varies by provider
 *
 * Output:
 *   stdout — the assistant reply (plain text)
 *   stderr — progress / status / token info
 *   exit 0 — success
 *   exit 1 — auth / access / key error
 *   exit 2 — transient error (timeout, network)
 */

import { readFileSync } from 'node:fs';

// ---- config ----

const ENDPOINT =
  process.env.LATTICE_CHAT_ENDPOINT?.trim().replace(/\/+$/, '') ||
  'https://www.ssvibelandiaquestfest24x365.com';

const API_URL = `${ENDPOINT}/api/lattice-chat`;

const EMAIL = process.env.LATTICE_CHAT_EMAIL?.trim() || '';
const API_KEY = process.env.LATTICE_CHAT_API_KEY?.trim() || '';
const PROVIDER = process.env.LATTICE_CHAT_PROVIDER?.trim().toLowerCase() || 'cursor';

function defaultModelFor(provider) {
  if (provider === 'claude') return 'claude-sonnet-4-5';
  if (provider === 'gemini') return 'antigravity-preview-05-2026';
  if (provider === 'openrouter') return 'deepseek/deepseek-chat';
  return 'auto';
}

const MODEL = process.env.LATTICE_CHAT_MODEL?.trim() || 'auto';

// ---- CLI args ----

function parseArgs(argv) {
  const args = { prompt: '', model: MODEL, provider: PROVIDER, history: null, threadId: null, agentId: null, dryRun: false, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { args.help = true; }
    else if (a === '--dry-run') { args.dryRun = true; }
    else if (a === '--prompt' && i + 1 < argv.length) { args.prompt = argv[++i]; }
    else if (a === '--model' && i + 1 < argv.length) { args.model = argv[++i]; }
    else if (a === '--provider' && i + 1 < argv.length) { args.provider = argv[++i].toLowerCase(); }
    else if (a === '--thread-id' && i + 1 < argv.length) { args.threadId = argv[++i]; }
    else if (a === '--agent-id' && i + 1 < argv.length) { args.agentId = argv[++i]; }
    else if (a === '--history' && i + 1 < argv.length) {
      try { args.history = JSON.parse(argv[++i]); } catch { args.history = null; }
    }
    else if (!a.startsWith('-')) { args.prompt = a; }
  }
  return args;
}

function showHelp() {
  process.stderr.write(`\
Hermes Lattice Chat CLI — BYOK proxy for Lattice Chat V1.618

USAGE
  node scripts/hermes-lattice-chat.mjs [--prompt <text>] [options]
  echo "prompt" | node scripts/hermes-lattice-chat.mjs [options]

OPTIONS
  --prompt <text>    The message to send
  --model <id>       Model ID (default: auto · deepseek/deepseek-chat · claude-sonnet-4-5 · antigravity-preview-05-2026)
  --provider <name>  cursor | claude | gemini | openrouter (default: cursor)
  --thread-id <id>   Resume an existing thread
  --agent-id <id>    Reattach to an existing agent
  --history <json>   Chat history as JSON array [{role,content}]
  --dry-run          Show what would be sent without calling the API
  --help, -h         This help

ENVIRONMENT
  LATTICE_CHAT_ENDPOINT   API base URL
  LATTICE_CHAT_EMAIL      Your email (Lattice access list)
  LATTICE_CHAT_API_KEY    Provider API key
  LATTICE_CHAT_PROVIDER   cursor | claude | gemini | openrouter
  LATTICE_CHAT_MODEL      Model ID

EXIT CODES
  0   Success
  1   Auth / access denied / missing key
  2   Transient error (timeout, network, server busy)
`);
}

// ---- main ----

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) { showHelp(); process.exit(0); }

  // Resolve default model from provider if not explicitly set
  if (!process.env.LATTICE_CHAT_MODEL && args.model === 'auto') {
    args.model = defaultModelFor(args.provider);
  }
  // Resolve prompt from stdin if not provided as arg
  if (!args.prompt) {
    const chunks = [];
    // Read up to 64KB from stdin (non-blocking if stdin is a pipe)
    const buf = readFileSync(0, 'utf8');
    if (buf) chunks.push(buf);
    args.prompt = chunks.join('').trim();
  }

  if (!args.prompt) {
    process.stderr.write('Error: no prompt provided. Use --prompt or pipe input.\n');
    process.exit(1);
  }

  // Dry run
  if (args.dryRun) {
    process.stderr.write(`\
DRY RUN — would POST to ${API_URL}
  provider: ${args.provider}
  model: ${args.model}
  email: ${EMAIL || '(not set)'}
  key: ${API_KEY ? API_KEY.slice(0, 8) + '…' : '(not set)'}
  thread: ${args.threadId || '(new)'}
  agent: ${args.agentId || '(none)'}
  prompt (${args.prompt.length} chars): ${args.prompt.slice(0, 120)}${args.prompt.length > 120 ? '…' : ''}
`);
    process.exit(0);
  }

  // Validate credentials
  if (!EMAIL) {
    process.stderr.write('Error: LATTICE_CHAT_EMAIL not set. Export your Lattice email.\n');
    process.exit(1);
  }
  if (!API_KEY) {
    process.stderr.write('Error: LATTICE_CHAT_API_KEY not set. Export your provider API key.\n');
    process.exit(1);
  }

  const body = {
    message: args.prompt,
    stream: true,
    model: args.model,
    provider: args.provider,
    nestTopology: 'goldilocks',
    mode: 'agent',
  };
  if (args.threadId) body.threadId = args.threadId;
  if (args.agentId) body.agentId = args.agentId;
  if (args.history) body.history = args.history;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    'x-lattice-email': EMAIL,
    'x-lattice-provider': args.provider,
  };
  if (args.provider === 'cursor') headers['x-cursor-api-key'] = API_KEY;
  else if (args.provider === 'claude') headers['x-anthropic-api-key'] = API_KEY;
  else if (args.provider === 'gemini') headers['x-gemini-api-key'] = API_KEY;
  else if (args.provider === 'openrouter') headers['x-openrouter-api-key'] = API_KEY;

  process.stderr.write(`→ Lattice Chat · ${args.provider} · ${args.model}\n`);
  const startedAt = Date.now();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300_000), // 5 min
    });

    const ct = String(res.headers.get('content-type') || '');

    if (!res.ok && !/text\/event-stream/i.test(ct)) {
      const data = await res.json().catch(() => ({}));
      process.stderr.write(`API error ${res.status}: ${data.error || data.reason || res.statusText}\n`);
      // Classify exit code
      if ([401, 403, 422].includes(res.status) ||
          /access|key|auth|grant|model|agent.*not.*found/i.test(data.error || data.code || '')) {
        process.exit(1);
      }
      process.exit(2);
    }

    // SSE stream
    if (/text\/event-stream/i.test(ct) && res.body) {
      let donePayload = null;
      let errorPayload = null;
      let buffer = '';
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        buffer = parseSseChunk(buffer, (event, data) => {
          if (event === 'transcript' && data?.type === 'thinking') {
            process.stderr.write(`  💭 ${(data.text || '').slice(0, 80)}…\n`);
          } else if (event === 'transcript' && data?.type === 'tool_call') {
            process.stderr.write(`  🔧 ${data.name || 'tool'}: ${data.status || 'running'}\n`);
          } else if (event === 'status') {
            process.stderr.write(`  ⏳ ${data.message || data.error || 'working…'}\n`);
          } else if (event === 'done') {
            donePayload = data;
          } else if (event === 'error') {
            errorPayload = data;
          }
        });
      }
      if (buffer.trim()) parseSseChunk(`${buffer}\n\n`, () => {});

      if (errorPayload) {
        process.stderr.write(`Lattice error: ${errorPayload.error || 'unknown'}\n`);
        process.exit(2);
      }

      const reply = (donePayload?.reply || '').trim();
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

      if (reply) {
        process.stdout.write(reply + '\n');
      } else {
        process.stderr.write(`⚠ No reply text returned.\n`);
        process.exit(2);
      }

      const tokens = donePayload?.tokens || donePayload?.execution?.tokens;
      if (tokens?.balanceDelta || tokens?.measuredTokens) {
        const used = tokens.measuredTokens || tokens.balanceDelta;
        process.stderr.write(`← ${used?.toLocaleString()} tokens used · ${elapsed}s\n`);
      } else {
        process.stderr.write(`← ${elapsed}s\n`);
      }

      if (donePayload?.agentId) {
        process.stderr.write(`agentId=${donePayload.agentId}\n`);
      }
      return;
    }

    // JSON response (non-streaming fallback)
    const data = await res.json();
    if (data.reply) {
      process.stdout.write(data.reply.trim() + '\n');
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      process.stderr.write(`← ${elapsed}s\n`);
    } else if (data.error) {
      process.stderr.write(`Lattice error: ${data.error}\n`);
      process.exit(1);
    } else {
      process.stderr.write('No reply received.\n');
      process.exit(2);
    }
  } catch (err) {
    if (err.name === 'TimeoutError' || err.code === 'timeout' || err.code === 'ABORT_ERR') {
      process.stderr.write('Timeout — the steward may still finish. Use --thread-id to recover.\n');
      process.exit(2);
    }
    if (/fetch|network|ECONNREFUSED|ENOTFOUND/i.test(err.message || '')) {
      process.stderr.write(`Network error: ${err.message}\n`);
      process.exit(2);
    }
    process.stderr.write(`Unexpected error: ${err.message}\n`);
    process.exit(2);
  }
}

function parseSseChunk(buffer, onEvent) {
  const parts = buffer.split('\n\n');
  const rest = parts.pop() ?? '';
  for (const part of parts) {
    const lines = part.split('\n');
    let event = 'message';
    const dataLines = [];
    for (const line of lines) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) continue;
    const raw = dataLines.join('\n');
    try { onEvent(event, JSON.parse(raw)); } catch { onEvent(event, raw); }
  }
  return rest;
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`);
  process.exit(2);
});
