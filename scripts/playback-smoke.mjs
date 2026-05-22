/**
 * Smoke test: questfest bridge loads catalog and audio plays after a list tap.
 * Usage: node scripts/playback-smoke.mjs
 */
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(ROOT, 'apps', 'ss-vibelandia-questfest');
const ORIGIN = process.env.CATALOG_PIPE_ORIGIN || 'https://psw-vibelandia-sing13-nine.vercel.app';
const PORT = Number(process.env.PLAYBACK_TEST_PORT || 4173);
const BASE = `http://127.0.0.1:${PORT}/interfaces/questfest-bridge/`;

async function waitForServer(ms = 60_000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Preview not ready at ${BASE}`);
}

function run(cmd, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: APP,
      env: { ...process.env, ...extraEnv },
      stdio: 'inherit',
      shell: true,
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}`))));
  });
}

function runPreview() {
  return spawn(
    'npm',
    ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    {
      cwd: APP,
      env: { ...process.env, VITE_CATALOG_PIPE_ORIGIN: ORIGIN },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    },
  );
}

async function main() {
  console.log('playback-smoke: build (preview proxies catalog to', ORIGIN + ')');
  await run('npm', ['run', 'build'], { VITE_CATALOG_PIPE_ORIGIN: ORIGIN });

  const playwrightEntry = path.join(APP, 'node_modules', 'playwright', 'index.mjs');
  const { chromium } = await import(pathToFileURL(playwrightEntry).href);
  const preview = runPreview();
  let previewOut = '';
  preview.stdout?.on('data', (d) => {
    previewOut += d;
  });
  preview.stderr?.on('data', (d) => {
    previewOut += d;
  });

  let page;
  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    page.setDefaultTimeout(120_000);

    page.on('console', (msg) => {
      if (msg.type() === 'error') console.error('[page]', msg.text());
    });

    const catalogWait = page.waitForResponse(
      (r) => r.url().includes('/api/catalog') && r.status() === 200,
      { timeout: 120_000 },
    );

    await page.goto(`${BASE}#/bridge`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await catalogWait;

    await page.waitForFunction(
      () => document.querySelectorAll('.sp-listen-play').length > 0,
      undefined,
      { timeout: 120_000 },
    );

    const rowCount = await page.locator('.sp-listen-play').count();
    if (rowCount < 1) throw new Error('No tracks in list after catalog sync');

    const playBtn = page.locator('.sp-listen-play').first();
    await playBtn.click();

    await page.waitForFunction(
      () => {
        const a = document.querySelector('audio.sp-media-playback-el');
        return a && !a.paused && a.currentTime > 0.05;
      },
      undefined,
      { timeout: 45_000 },
    );

    const state = await page.evaluate(() => {
      const a = document.querySelector('audio.sp-media-playback-el');
      return {
        paused: a?.paused,
        time: a?.currentTime,
        src: a?.src?.slice(0, 80),
        error: document.querySelector('.sp-now-error')?.textContent || null,
      };
    });

    console.log('playback-smoke: OK', { rows: rowCount, ...state });
    await browser.close();
  } catch (err) {
    console.error('playback-smoke: FAIL', err.message);
    try {
      const snap = await page.evaluate(() => {
        const a = document.querySelector('audio.sp-media-playback-el');
        return {
          plays: document.querySelectorAll('.sp-listen-play').length,
          paused: a?.paused,
          time: a?.currentTime,
          src: a?.src || null,
          ready: a?.readyState,
          err: a?.error?.message || document.querySelector('.sp-now-error')?.textContent || null,
          isPlaying: document.querySelector('.sp-pl-edit-row--listen-on') != null,
        };
      });
      console.error('playback-smoke: snap', snap);
    } catch {
      /* page may be closed */
    }
    if (previewOut) console.error(previewOut.slice(-2000));
    process.exitCode = 1;
  } finally {
    preview.kill('SIGTERM');
  }
}

main();
