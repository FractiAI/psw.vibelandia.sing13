import { CORE_REPOS, GITHUB_USER_AGENT } from './constants.mjs';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch commits in [since, until) from GitHub REST (public, no token).
 */
export async function fetchRepoCommits(owner, repo, sinceIso, untilIso, maxPages = 5) {
  const rows = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const url =
      `https://api.github.com/repos/${owner}/${repo}/commits` +
      `?since=${encodeURIComponent(sinceIso)}&until=${encodeURIComponent(untilIso)}` +
      `&per_page=100&page=${page}`;
    const r = await fetch(url, { headers: { 'User-Agent': GITHUB_USER_AGENT } });
    if (r.status === 404 || r.status === 409) break;
    if (!r.ok) throw new Error(`${owner}/${repo} → HTTP ${r.status}`);
    const batch = await r.json();
    if (!Array.isArray(batch) || !batch.length) break;
    for (const c of batch) {
      rows.push({
        sha: c.sha,
        shaShort: c.sha.slice(0, 8),
        date: c.commit?.committer?.date || c.commit?.author?.date,
        message: (c.commit?.message || '').split('\n')[0].trim(),
        htmlUrl: c.html_url,
        author: c.commit?.author?.name,
      });
    }
    if (batch.length < 100) break;
    await sleep(400);
  }
  return rows;
}

export async function fetchKingBeeWindowTelemetry() {
  const windows = [
    {
      id: 'king_bee_init',
      label: 'King Bee initialization window',
      since: '2026-05-31T00:00:00Z',
      until: '2026-06-02T00:00:00Z',
    },
    {
      id: 'pre_jspace_eval',
      label: 'Pre-J-Space public paper (35-day propagation claim)',
      since: '2026-06-01T00:00:00Z',
      until: '2026-07-07T00:00:00Z',
    },
    {
      id: 'jspace_release_week',
      label: 'Anthropic J-Space paper release week (claimed)',
      since: '2026-07-01T00:00:00Z',
      until: '2026-07-10T00:00:00Z',
    },
  ];

  const byRepo = {};
  for (const { owner, repo, role } of CORE_REPOS) {
    const key = `${owner}/${repo}`;
    byRepo[key] = { owner, repo, role, windows: {} };
    for (const w of windows) {
      const commits = await fetchRepoCommits(owner, repo, w.since, w.until);
      byRepo[key].windows[w.id] = {
        ...w,
        commitCount: commits.length,
        commits: commits.slice(0, 50),
      };
      await sleep(350);
    }
  }
  return { fetchedAt: new Date().toISOString(), windows, byRepo };
}
