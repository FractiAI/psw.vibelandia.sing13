import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

let cache = null;
let cacheAt = 0;
const TTL_MS = 60_000;

export async function loadBulletinBoard() {
  if (cache && Date.now() - cacheAt < TTL_MS) return cache;
  const raw = await readFile(join(process.cwd(), 'data/bulletin-board-posts.json'), 'utf8');
  const parsed = JSON.parse(raw);
  const posts = (parsed.posts || []).filter((p) => p.surfaceVisible !== false);
  cache = { ...parsed, posts };
  cacheAt = Date.now();
  return cache;
}
