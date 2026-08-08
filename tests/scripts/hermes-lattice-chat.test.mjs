import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CLI = join(ROOT, 'scripts', 'hermes-lattice-chat.mjs');

function run(args = [], opts = {}) {
  return spawnSync(process.execPath, [CLI, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 10_000,
    stdio: 'pipe',
    ...opts,
  });
}

describe('hermes-lattice-chat CLI', () => {
  it('--help exits 0 and prints usage', () => {
    const r = run(['--help']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('Hermes Lattice Chat CLI');
    expect(r.stderr).toContain('USAGE');
  });

  it('-h also works', () => {
    const r = run(['-h']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('USAGE');
  });

  it('--dry-run exits 0 with config summary', () => {
    const r = run(['--dry-run', '--prompt', 'hello']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('DRY RUN');
    expect(r.stderr).toContain('hello');
    expect(r.stderr).toContain('cursor');
  });

  it('--dry-run with pipe input', () => {
    const r = run(['--dry-run'], { input: 'hello from stdin' });
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('DRY RUN');
    expect(r.stderr).toContain('hello from stdin');
  });

  it('--dry-run with --provider claude', () => {
    const r = run(['--dry-run', '--prompt', 'test', '--provider', 'claude']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('claude');
    expect(r.stderr).toContain('claude-sonnet-4-5');
  });

  it('--dry-run with --provider gemini', () => {
    const r = run(['--dry-run', '--prompt', 'test', '--provider', 'gemini']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('gemini');
    expect(r.stderr).toContain('antigravity');
  });

  it('--dry-run with --provider openrouter', () => {
    const r = run(['--dry-run', '--prompt', 'test', '--provider', 'openrouter']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('openrouter');
    expect(r.stderr).toContain('deepseek/deepseek-chat');
  });

  it('--dry-run supports direct/plain mode and top-p without exposing a key', () => {
    const r = run(['--dry-run', '--plain', '--top-p', '0.3', '--prompt', 'test']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('none (plain/direct)');
    expect(r.stderr).toContain('topP: 0.3');
    expect(r.stderr).not.toMatch(/sk-[a-z0-9]|key_[a-z0-9]|AIza/i);
  });

  it('rejects an out-of-range top-p value without calling the API', () => {
    const r = run(['--top-p', '1.1', '--prompt', 'test']);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('--top-p must be a number');
  });

  it('--help documents plain, json, and top-p', () => {
    const r = run(['--help']);
    expect(r.stderr).toContain('--plain');
    expect(r.stderr).toContain('--json');
    expect(r.stderr).toContain('--top-p');
  });

  it('--dry-run with --model override', () => {
    const r = run(['--dry-run', '--prompt', 'test', '--model', 'claude-sonnet-5-thinking-high']);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('claude-sonnet-5-thinking-high');
  });

  it('--dry-run with --thread-id and --agent-id', () => {
    const r = run([
      '--dry-run', '--prompt', 'test',
      '--thread-id', 'thread_abc',
      '--agent-id', 'agent_xyz',
    ]);
    expect(r.status).toBe(0);
    expect(r.stderr).toContain('thread_abc');
    expect(r.stderr).toContain('agent_xyz');
  });

  it('exits 1 when no email set (no --dry-run)', () => {
    const r = run(['--prompt', 'test']);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('LATTICE_CHAT_EMAIL');
  });

  it('exits 1 when no prompt and no stdin', () => {
    const r = run([]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('no prompt');
  });
});
