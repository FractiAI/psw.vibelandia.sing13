#!/usr/bin/env node
/**
 * CLI: npm run hero-leo:scout
 *      npm run hero-leo:complete -- --ids=P-C11-WETLAB-PILOT,P-PUBLICATION-GATE-CAL
 *      npm run hero-leo:complete -- --all
 */
import { runFullScout, completeSelectedProspects, loadProspectBoard, TOP_N } from '../lib/hero-leo-scout.mjs';

const args = process.argv.slice(2);
const isComplete = args.includes('--complete') || process.env.HERO_LEO_ACTION === 'complete';
const all = args.includes('--all');
const idsArg = args.find((a) => a.startsWith('--ids='));

if (isComplete) {
  let ids = [];
  if (all) {
    const board = loadProspectBoard();
    ids = (board?.prospects || [])
      .filter((p) => p.selection_status !== 'completed' && !p.already_completed)
      .map((p) => p.prospect_id);
  } else if (idsArg) {
    ids = idsArg
      .slice('--ids='.length)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const result = completeSelectedProspects(ids);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.ok ? 0 : 1);
} else {
  const board = runFullScout({ topN: TOP_N });
  console.log(
    JSON.stringify(
      {
        ok: true,
        scoutId: board.scoutId,
        nReturned: board.nReturned,
        top: board.prospects.map((p) => ({
          rank: p.rank,
          id: p.prospect_id,
          score: p.priority_score,
          title: p.title,
        })),
      },
      null,
      2,
    ),
  );
}
