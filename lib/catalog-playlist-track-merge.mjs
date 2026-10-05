/**
 * Union local pending playlist track adds onto a server track list.
 * Server order is the base; local-only ids append (deduped). Unknown ids drop.
 *
 * Mirrors apps/ss-vibelandia-questfest/src/lib/catalogSeed.ts · mergeUserPlaylistTrackIds
 * so root vitest can lock the add-track race fix without a TS loader.
 *
 * @param {string[]} serverTrackIds
 * @param {string[]} localTrackIds
 * @param {Record<string, unknown>} trackMap
 * @returns {string[]}
 */
export function mergeUserPlaylistTrackIds(serverTrackIds, localTrackIds, trackMap) {
  const server = (Array.isArray(serverTrackIds) ? serverTrackIds : []).filter((id) => trackMap[id]);
  const seen = new Set(server);
  const out = [...server];
  for (const id of Array.isArray(localTrackIds) ? localTrackIds : []) {
    if (!trackMap[id] || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}
