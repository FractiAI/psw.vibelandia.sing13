/**
 * Shared schematic ↔ WGS84 for Turner pastures (matches turner-rangeland-map.js).
 */

export const TURNER_MAP_W = 1000;
export const TURNER_MAP_H = 620;

export function polygonBounds(poly) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of poly) {
    minX = Math.min(minX, c[0]);
    maxX = Math.max(maxX, c[0]);
    minY = Math.min(minY, c[1]);
    maxY = Math.max(maxY, c[1]);
  }
  return { minX, maxX, minY, maxY };
}

export function polygonCentroid(poly) {
  const sx = poly.reduce((s, c) => s + c[0], 0) / poly.length;
  const sy = poly.reduce((s, c) => s + c[1], 0) / poly.length;
  return { scx: sx, scy: sy };
}

export function pastureGeoScale(pasture, bbox) {
  const poly = pasture.polygon;
  const pb = polygonBounds(poly);
  const pw = Math.max(pb.maxX - pb.minX, 48);
  const ph = Math.max(pb.maxY - pb.minY, 48);
  const { scx, scy } = polygonCentroid(poly);
  const acreScale = Math.sqrt((pasture.acres || 120000) / 220000);
  const net = bbox || { west: -114, east: -100, south: 32, north: 48 };
  const dLon = 1.15 * acreScale * (pw / TURNER_MAP_W) * (net.east - net.west);
  const dLat = 0.95 * acreScale * (ph / TURNER_MAP_H) * (net.north - net.south);
  return { scx, scy, pw, ph, dLon, dLat };
}

export function schematicToLatLng(x, y, pasture, bbox) {
  const b = bbox || { west: -114, east: -100, south: 32, north: 48 };
  if (pasture.lat == null || pasture.lon == null) {
    const lat = b.north - (y / TURNER_MAP_H) * (b.north - b.south);
    const lng = b.west + (x / TURNER_MAP_W) * (b.east - b.west);
    return { lat, lng };
  }
  const g = pastureGeoScale(pasture, b);
  return {
    lat: pasture.lat + ((g.scy - y) / g.ph) * g.dLat,
    lng: pasture.lon + ((x - g.scx) / g.pw) * g.dLon,
  };
}

/** Inverse of pasture-local schematic projection (for GPS fence vertices). */
export function latLngToSchematic(lat, lng, pasture, bbox) {
  const b = bbox || { west: -114, east: -100, south: 32, north: 48 };
  if (pasture.lat == null || pasture.lon == null) {
    return {
      x: ((lng - b.west) / (b.east - b.west)) * TURNER_MAP_W,
      y: (1 - (lat - b.south) / (b.north - b.south)) * TURNER_MAP_H,
    };
  }
  const g = pastureGeoScale(pasture, b);
  return {
    x: g.scx + ((lng - pasture.lon) / g.dLon) * g.pw,
    y: g.scy - ((lat - pasture.lat) / g.dLat) * g.ph,
  };
}
