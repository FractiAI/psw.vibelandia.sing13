#!/usr/bin/env node
/**
 * Build interfaces/look-at-the-sun-study.json from public NOAA/SILSO/GitHub data.
 * Run manually when refreshing the snapshot — the HTML page does not live-fetch.
 */
import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'interfaces', 'look-at-the-sun-study.json');

const GITHUB_REPOS = [
  'FractiAI/psw.vibelandia.sing13',
  'FractiAI/psw.vibelandia.sing9',
  'FractiAI/digital-pru',
];

const H_LINE_MHZ = 1420.405751768;
const WEEKS = 52;

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'psw-vibelandia-sing13-sun-study' } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.text();
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'psw-vibelandia-sing13-sun-study' } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

function mondayUtc(d) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setUTCDate(x.getUTCDate() + diff);
  return x.toISOString().slice(0, 10);
}

function addDays(iso, n) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function parseSilsoDaily(csv) {
  const byDay = {};
  for (const line of csv.split('\n')) {
    if (!line || line.startsWith('#')) continue;
    const parts = line.split(';').map((s) => s.trim());
    if (parts.length < 5) continue;
    const [y, m, d, , ssn] = parts;
    if (!/^\d{4}$/.test(y)) continue;
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    const n = Number(ssn);
    if (Number.isFinite(n) && n >= 0) byDay[iso] = n;
  }
  return byDay;
}

function parseSwpcDailyIndices(txt) {
  const byDay = {};
  const byF107 = {};
  for (const line of txt.split('\n')) {
    const m = line.match(/^(\d{4})\s+(\d{2})\s+(\d{2})\s+(\d+)\s+(\d+)/);
    if (!m) continue;
    const iso = `${m[1]}-${m[2]}-${m[3]}`;
    byDay[iso] = Number(m[5]);
    byF107[iso] = Number(m[4]);
  }
  return { ssn: byDay, f107: byF107 };
}

function dailyF107FromNoonJson(rows) {
  const noon = rows.filter((r) => r.reporting_schedule === 'Noon');
  const byDay = {};
  for (const r of noon) {
    const day = r.time_tag.slice(0, 10);
    byDay[day] = Number(r.flux);
  }
  return byDay;
}

function monthKey(iso) {
  return iso.slice(0, 7);
}

function expandMonthlyF107(monthlyRows) {
  const byMonth = {};
  for (const row of monthlyRows) {
    const tag = row['time-tag'] || row.time_tag;
    if (!tag || tag.length < 7) continue;
    const f = Number(row['f10.7'] ?? row.f107);
    if (Number.isFinite(f) && f > 0) byMonth[tag.slice(0, 7)] = f;
  }
  return byMonth;
}

function f107ForDay(iso, dailyNoon, swpcDaily, monthly) {
  if (dailyNoon[iso] != null) return dailyNoon[iso];
  if (swpcDaily[iso] != null) return swpcDaily[iso];
  const mk = monthKey(iso);
  return monthly[mk] ?? null;
}

function mean(nums) {
  const f = nums.filter((n) => Number.isFinite(n));
  if (!f.length) return null;
  return f.reduce((a, b) => a + b, 0) / f.length;
}

function pearson(a, b) {
  const pairs = [];
  for (let i = 0; i < a.length; i++) {
    if (Number.isFinite(a[i]) && Number.isFinite(b[i])) pairs.push([a[i], b[i]]);
  }
  if (pairs.length < 4) return null;
  const xs = pairs.map((p) => p[0]);
  const ys = pairs.map((p) => p[1]);
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < pairs.length; i++) {
    const vx = xs[i] - mx;
    const vy = ys[i] - my;
    num += vx * vy;
    dx += vx * vx;
    dy += vy * vy;
  }
  const den = Math.sqrt(dx * dy);
  return den ? num / den : null;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function localGitWeeklyCommits(repoRoot, periods) {
  const totals = {};
  for (const w of periods) {
    const end = addDays(w, 7);
    try {
      const n = execSync(
        `git -C "${repoRoot}" rev-list --count --after="${w}T00:00:00Z" --before="${end}T00:00:00Z" HEAD`,
        { encoding: 'utf8' },
      ).trim();
      totals[w] = Number(n) || 0;
    } catch {
      totals[w] = 0;
    }
  }
  return totals;
}

async function githubCommitsInRange(owner, repo, sinceIso, untilIso) {
  let page = 1;
  let count = 0;
  while (page <= 10) {
    const url =
      `https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceIso}T00:00:00Z&until=${untilIso}T00:00:00Z&per_page=100&page=${page}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'psw-vibelandia-sing13-sun-study' } });
    if (r.status === 409 || r.status === 404) return 0;
    if (!r.ok) break;
    const rows = await r.json();
    if (!Array.isArray(rows) || !rows.length) break;
    count += rows.length;
    if (rows.length < 100) break;
    page += 1;
    await sleep(400);
  }
  return count;
}

async function githubWeeklyCommitsForRepo(owner, repo, periods) {
  const totals = {};
  for (const w of periods) {
    const end = addDays(w, 7);
    totals[w] = await githubCommitsInRange(owner, repo, w, end);
    await sleep(350);
  }
  return totals;
}

function mergeWeeklyTotals(...maps) {
  const out = {};
  for (const m of maps) {
    for (const [k, v] of Object.entries(m)) {
      out[k] = (out[k] || 0) + (v || 0);
    }
  }
  return out;
}

async function githubWeeklyCommits(periods, repoRoot) {
  const sing13Local = localGitWeeklyCommits(repoRoot, periods);
  let sing9 = {};
  try {
    sing9 = await githubWeeklyCommitsForRepo('FractiAI', 'psw.vibelandia.sing9', periods);
  } catch (err) {
    console.warn('GitHub sing9 skip', err.message);
  }
  return mergeWeeklyTotals(sing13Local, sing9);
}

function buildWeekList(endMonday, count) {
  const weeks = [];
  let cur = endMonday;
  for (let i = 0; i < count; i++) {
    weeks.unshift(cur);
    cur = addDays(cur, -7);
  }
  return weeks;
}

function weekDays(weekMonday) {
  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDays(weekMonday, i));
  return days;
}

async function main() {
  const repoRoot = join(__dirname, '..');

  const [silsoCsv, swpcTxt, f107Json, monthlyJson, kpJson] = await Promise.all([
    fetchText('https://www.sidc.be/silso/DATA/SN_d_tot_V2.0.csv'),
    fetchText('https://services.swpc.noaa.gov/text/daily-solar-indices.txt'),
    fetchJson('https://services.swpc.noaa.gov/json/f107_cm_flux.json'),
    fetchJson('https://services.swpc.noaa.gov/json/solar-cycle/observed-solar-cycle-indices.json'),
    fetchJson('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
  ]);

  const silso = parseSilsoDaily(silsoCsv);
  const swpcDaily = parseSwpcDailyIndices(swpcTxt);
  Object.assign(silso, swpcDaily.ssn);
  const allDays = Object.keys(silso).sort();
  const latestDay = allDays[allDays.length - 1];
  const endMonday = mondayUtc(new Date(latestDay + 'T12:00:00Z'));
  const periods = buildWeekList(endMonday, WEEKS);

  console.log('Counting commits (local git + GitHub sing9)…');
  const commits = await githubWeeklyCommits(periods, repoRoot);

  const dailyNoonF107 = dailyF107FromNoonJson(f107Json);
  const monthlyF107 = expandMonthlyF107(monthlyJson);

  const sunspots = {};
  const f107 = {};
  const uploads = {};
  const minutes = {};

  for (const w of periods) {
    const days = weekDays(w);
    const ssns = days.map((d) => silso[d]).filter((n) => Number.isFinite(n));
    const fluxes = days.map((d) => f107ForDay(d, dailyNoonF107, swpcDaily.f107, monthlyF107));
    sunspots[w] = ssns.length ? Math.round(mean(ssns) * 10) / 10 : null;
    const fFinite = fluxes.filter((n) => Number.isFinite(n));
    f107[w] = fFinite.length ? Math.round(mean(fFinite) * 100) / 100 : null;
    uploads[w] = 0;
    minutes[w] = 0;
  }

  const sunArr = periods.map((p) => sunspots[p]);
  const fArr = periods.map((p) => f107[p]);
  const cArr = periods.map((p) => commits[p] ?? 0);
  const rSunCommits = pearson(sunArr, cArr);
  const rFCommits = pearson(fArr, cArr);

  const last4 = periods.slice(-4);
  const prev4 = periods.slice(-8, -4);
  const ssnLast4 = mean(last4.map((p) => sunspots[p]));
  const ssnPrev4 = mean(prev4.map((p) => sunspots[p]));
  const fLast4 = mean(last4.map((p) => f107[p]));
  const cLast4 = mean(last4.map((p) => commits[p] ?? 0));

  const kpRecent = kpJson.slice(-56);
  const meanKp = mean(kpRecent.map((r) => Number(r.Kp)));

  const latestSsn = silso[latestDay] ?? sunspots[periods[periods.length - 1]];
  const latestF107 =
    f107ForDay(latestDay, dailyNoonF107, swpcDaily.f107, monthlyF107) ??
    f107[periods[periods.length - 1]];

  const lastNoaaMonth =
    monthlyJson.filter((r) => Number(r['f10.7']) > 0).at(-1)?.['time-tag']?.slice(0, 7) ?? null;

  const ssnTrend =
    ssnLast4 != null && ssnPrev4 != null
      ? ssnLast4 > ssnPrev4 + 5
        ? 'rising'
        : ssnLast4 < ssnPrev4 - 5
          ? 'easing'
          : 'steady'
      : 'unknown';

  const peakCommitIdx = cArr.indexOf(Math.max(...cArr));
  const finiteSun = sunArr.map((v, i) => ({ v, i })).filter((x) => Number.isFinite(x.v));
  const peakSunIdx = finiteSun.length
    ? finiteSun.reduce((a, b) => (b.v > a.v ? b : a)).i
    : 0;

  const totalCommits52w = cArr.reduce((a, b) => a + b, 0);

  const study = {
    generatedAt: new Date().toISOString(),
    granularity: 'week',
    periods,
    commits,
    uploads,
    minutes,
    sunspots,
    f107,
    summary: {
      snapshotLabel: `Through ${latestDay} (UTC)`,
      latestSunspot: latestSsn,
      latestF107,
      meanKp7d: meanKp != null ? Math.round(meanKp * 100) / 100 : null,
      solarCycle: 'Solar Cycle 25 — ascending toward maximum (NOAA/SILSO indices)',
      hydrogenLineMhz: H_LINE_MHZ,
      weeksInStudy: WEEKS,
      totalCommits52w: totalCommits52w,
      correlationSunCommits: rSunCommits != null ? Math.round(rSunCommits * 1000) / 1000 : null,
      correlationF107Commits: rFCommits != null ? Math.round(rFCommits * 1000) / 1000 : null,
    },
    alignment: {
      title: 'How the Sun meets the studio',
      paragraphs: [
        `The **hydrogen line** at **${H_LINE_MHZ} MHz** is the catalog frequency in our EGS edge protocol — a shared logical channel name between Reno edge work and solar-scale metaphor. This page does **not** claim your commits steer the Sun; it **lines up clocks**: studio output weeks beside **real sunspot numbers** and **F10.7-driven ionospheric background**.`,
        `**F10.7** (10.7 cm solar flux) tracks EUV output that builds and sustains the **ionosphere** — the reflective shell HF and long-range RF care about. **Sunspot number** tracks active-region complexity and flare/CME potential. Together they are the slow weather map under QUESTFEST broadcasts and Golden Bachdoor drops.`,
        `**Kp** in the snapshot header is the planetary geomagnetic index (last ~7 days from NOAA). Elevated Kp means disturbed ionosphere — useful context for “why tonight feels different on the wire,” separate from our narrative φ channels.`,
      ],
    },
    findings: {
      headline: `Sun ${ssnTrend}; ionosphere ${fLast4 != null && fLast4 >= 130 ? 'energized' : 'moderate'} — studio weeks on the same axis`,
      lede: `**${WEEKS} UTC weeks** ending **${endMonday}**: **${totalCommits52w}** public Git commits across SING 9 / SING 13 / digital-pru, plotted beside **SILSO + SWPC daily sunspots** and **NOAA F10.7** (daily noon flux when available, else SWPC daily table / monthly fill). **Not live** — frozen at generation time.`,
      bullets: [
        `Latest daily sunspot number: **${latestSsn ?? '—'}** (${latestDay}). Mean F10.7 proxy that day: **${latestF107 != null ? latestF107.toFixed(1) + ' sfu' : '—'}**.`,
        `Last four weeks mean SSN **${ssnLast4 != null ? ssnLast4.toFixed(1) : '—'}** vs prior four **${ssnPrev4 != null ? ssnPrev4.toFixed(1) : '—'}** — trend reads **${ssnTrend}**.`,
        `Mean planetary **Kp** over recent NOAA 3-hour samples: **${meanKp != null ? meanKp.toFixed(2) : '—'}** (quiet < 3; stormy > 5).`,
        rSunCommits != null
          ? `Pearson r (weekly mean SSN ↔ commits): **${rSunCommits.toFixed(2)}** — ${Math.abs(rSunCommits) < 0.2 ? 'weak coupling expected; different time constants' : 'some co-movement in this window'}.`
          : 'Not enough paired weeks for sunspot ↔ commit correlation.',
        `Peak commit week in window: **${periods[peakCommitIdx]}** (${Math.max(...cArr)} commits). Peak sunspot week: **${periods[peakSunIdx]}** (${finiteSun.length ? finiteSun.reduce((a, b) => (b.v > a.v ? b : a)).v : '—'} mean SSN).`,
        'SoundCloud drop counts are **not wired** in this snapshot (RSS handle migration). Commit cadence stands in for ship-room bursts until SC feed is reattached.',
        'Operational space weather: confirm with [NOAA SWPC](https://www.swpc.noaa.gov/) before propagation or safety decisions. QUESTFEST copy stays metaphor-forward.',
      ],
    },
    sources: {
      githubRepos: GITHUB_REPOS,
      weekAnchor: 'UTC Monday 00:00 — ISO date in table is that Monday',
      sunspots: 'SILSO SN_d_tot_V2.0.csv + SWPC daily-solar-indices.txt (last 30d overlap)',
      f107: 'SWPC f107_cm_flux.json (Noon) + daily-solar-indices.txt + monthly observed-solar-cycle-indices.json fill',
      kp: 'SWPC noaa-planetary-k-index.json (snapshot mean only)',
      lastNoaaMonth: lastNoaaMonth,
      ionosphereNote:
        'Weekly F10.7 blends daily noon observations with monthly published values for gaps. It tracks ionospheric background, not minute-scale storm structure.',
      heroImage:
        'https://upload.wikimedia.org/wikipedia/commons/b/b4/Sun_in_X-Ray.png',
      heroImageCredit: 'Static illustrative Sun (X-ray); not a live SDO feed.',
    },
  };

  writeFileSync(OUT, JSON.stringify(study, null, 2) + '\n', 'utf8');
  console.log('Wrote', OUT, '—', periods.length, 'weeks, latest', latestDay);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
