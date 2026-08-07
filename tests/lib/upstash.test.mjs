import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'node:http';
import { redisGet } from '../../lib/upstash.mjs';

const ENV_KEYS = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_TIMEOUT_MS'];
const savedEnv = new Map();
const servers = [];

function saveEnv() {
  savedEnv.clear();
  for (const key of ENV_KEYS) savedEnv.set(key, process.env[key]);
}

function restoreEnv() {
  for (const [key, value] of savedEnv) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function startServer(handler) {
  return new Promise((resolve) => {
    const server = createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      servers.push(server);
      resolve({ server, port: server.address().port });
    });
  });
}

async function closeServers() {
  for (const server of servers.splice(0)) {
    server.closeAllConnections?.();
    await new Promise((r) => server.close(() => r()));
  }
}

beforeEach(() => saveEnv());
afterEach(async () => {
  await closeServers();
  restoreEnv();
});

describe('upstash bounded timeout', () => {
  it('returns the result from a responding endpoint', async () => {
    const { port } = await startServer((req, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result: 'ok' }));
      }, 20);
    });
    process.env.UPSTASH_REDIS_REST_URL = `http://127.0.0.1:${port}`;
    process.env.UPSTASH_REDIS_REST_TOKEN = 't';
    process.env.UPSTASH_TIMEOUT_MS = '2000';
    await expect(redisGet('k')).resolves.toBe('ok');
  });

  it('times out and resolves null when the endpoint never responds', async () => {
    const { port } = await startServer(() => {
      // Never respond — hang the connection so the abort timeout must fire.
    });
    process.env.UPSTASH_REDIS_REST_URL = `http://127.0.0.1:${port}`;
    process.env.UPSTASH_REDIS_REST_TOKEN = 't';
    process.env.UPSTASH_TIMEOUT_MS = '150';
    const result = await Promise.race([
      redisGet('k'),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('upstash timeout regression: call hung')), 3000)
      ),
    ]);
    expect(result).toBeNull();
  });
});
