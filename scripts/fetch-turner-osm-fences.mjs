#!/usr/bin/env node
/**
 * One-shot: pull OSM fence ways for all Turner pastures → data/turner-osm-fence-cache.json
 * Run locally (Overpass can take several minutes): node scripts/fetch-turner-osm-fences.mjs
 */
import { loadRangelandGeography } from '../lib/turner-radar-fusion.mjs';
import { fetchOsmFenceLinesByPasture } from '../lib/turner-osm-fence-lines.mjs';

const g = await loadRangelandGeography();
console.log('Fetching OSM fence ways for', g.pastures.length, 'pastures…');
const result = await fetchOsmFenceLinesByPasture(g, { skipCache: true });
console.log('ways', result.wayCount, 'error', result.error);
for (const p of g.pastures) {
  const n = result.byPasture[p.id]?.length ?? 0;
  console.log(' ', p.id, n, 'line(s)');
}
console.log('Wrote data/turner-osm-fence-cache.json (if ways > 0)');
