/**
 * Turner Enterprise Rangelands — pure chart math (geometry, herd stats, tier helpers).
 * Factored out of turner-rangeland-map.js so the logic is unit-testable without a
 * canvas/DOM. Load before turner-rangeland-map.js; exposes TurnerRangelandMapCore.
 */
(function (global) {
  'use strict';

  const SEX = { male: 0, female: 1, calf: 2 };

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /** Normalize free-text fields for pipe-delimited plain-text export lines. */
  function escapePlainField(s) {
    return String(s ?? '')
      .replace(/\r?\n/g, ' ')
      .replace(/\|/g, '/');
  }

  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0];
      const yi = poly[i][1];
      const xj = poly[j][0];
      const yj = poly[j][1];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  function polygonBounds(poly) {
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

  function randomInPoly(poly, rng) {
    const b = polygonBounds(poly);
    for (let i = 0; i < 60; i++) {
      const x = b.minX + rng() * (b.maxX - b.minX);
      const y = b.minY + rng() * (b.maxY - b.minY);
      if (pointInPoly(x, y, poly)) return { x, y };
    }
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    return { x: cx, y: cy };
  }

  function sampleBilinearField(x, y, bounds, gridSize, weights) {
    const w = bounds.maxX - bounds.minX;
    const h = bounds.maxY - bounds.minY;
    if (w <= 0 || h <= 0) return 0;
    const u = ((x - bounds.minX) / w) * gridSize - 0.5;
    const v = ((y - bounds.minY) / h) * gridSize - 0.5;
    const gx = Math.floor(u);
    const gy = Math.floor(v);
    const fx = u - gx;
    const fy = v - gy;
    const at = (ix, iy) => {
      const cx = Math.max(0, Math.min(gridSize - 1, ix));
      const cy = Math.max(0, Math.min(gridSize - 1, iy));
      return weights[cy * gridSize + cx] ?? 0;
    };
    return (
      at(gx, gy) * (1 - fx) * (1 - fy) +
      at(gx + 1, gy) * fx * (1 - fy) +
      at(gx, gy + 1) * (1 - fx) * fy +
      at(gx + 1, gy + 1) * fx * fy
    );
  }

  function pickWeightedPosition(weights, gridSize, poly, rng) {
    const bounds = polygonBounds(poly);
    let maxW = 0;
    for (const wt of weights) if (wt > maxW) maxW = wt;
    if (maxW > 0) {
      for (let t = 0; t < 56; t++) {
        const x = bounds.minX + rng() * (bounds.maxX - bounds.minX);
        const y = bounds.minY + rng() * (bounds.maxY - bounds.minY);
        if (!pointInPoly(x, y, poly)) continue;
        const field = sampleBilinearField(x, y, bounds, gridSize, weights);
        if (rng() < field / maxW) {
          const jx = x + (rng() - 0.5) * ((bounds.maxX - bounds.minX) / gridSize) * 0.9;
          const jy = y + (rng() - 0.5) * ((bounds.maxY - bounds.minY) / gridSize) * 0.9;
          if (pointInPoly(jx, jy, poly)) return { x: jx, y: jy };
          return { x, y };
        }
      }
    }
    return randomInPoly(poly, rng);
  }

  function closestPointOnSegment(lng1, lat1, lng2, lat2, lngP, latP) {
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const len2 = dx * dx + dy * dy;
    if (len2 < 1e-24) return { lng: lng1, lat: lat1, t: 0 };
    let t = ((lngP - lng1) * dx + (latP - lat1) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    return { lng: lng1 + t * dx, lat: lat1 + t * dy, t };
  }

  function distSqLngLat(lngA, latA, lngB, latB) {
    const mx = Math.cos(((latA + latB) * Math.PI) / 360);
    const dx = (lngA - lngB) * mx;
    const dy = latA - latB;
    return dx * dx + dy * dy;
  }

  function buildPastureTrampleIndex(fc) {
    const by = {};
    if (!fc || fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) return by;
    for (const f of fc.features) {
      const pid = (f.properties && (f.properties.pastureId || f.properties.pasture_id)) || null;
      if (!pid || !f.geometry) continue;
      const g = f.geometry;
      const lines = [];
      if (g.type === 'LineString' && Array.isArray(g.coordinates) && g.coordinates.length >= 2) {
        lines.push(g.coordinates);
      } else if (g.type === 'MultiLineString' && Array.isArray(g.coordinates)) {
        for (const ring of g.coordinates) {
          if (ring && ring.length >= 2) lines.push(ring);
        }
      }
      if (!by[pid]) by[pid] = [];
      for (const ln of lines) by[pid].push(ln);
    }
    return by;
  }

  function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /** TESF cow-unit baseline + sex class (+ optional radar field). RNG spread only when stream allows synthetic. */
  function estimateBisonWeightLbs(b, opts) {
    const mean = opts.meanWeightLbs ?? 1100;
    const synth = opts.syntheticDataAllowed === true;
    const rng = mulberry32(hashSeed(`${b.id}:${opts.placementSeed ?? 0}`));
    let lbs;
    if (b.sex === SEX.calf) {
      lbs = synth ? mean * (0.34 + rng() * 0.14) : mean * 0.41;
    } else if (b.sex === SEX.male) {
      lbs = synth ? mean * 1.16 * (0.92 + rng() * 0.16) : mean * 1.16;
    } else {
      lbs = synth ? mean * (0.9 + rng() * 0.2) : mean;
    }
    if (opts.radarField != null && Number.isFinite(opts.radarField)) {
      lbs *= 0.93 + Math.min(1, Math.max(0, opts.radarField)) * 0.14;
    }
    return Math.max(200, Math.round(lbs));
  }

  function labelTier(zoom) {
    if (zoom >= 11) return 3;
    if (zoom >= 9) return 2;
    if (zoom >= 7) return 1;
    return 0;
  }

  function visualStride(zoom) {
    if (zoom <= 5) return { dots: 4, trails: 10 };
    if (zoom <= 6) return { dots: 2, trails: 6 };
    if (zoom <= 7) return { dots: 1, trails: 4 };
    if (zoom <= 9) return { dots: 1, trails: 2 };
    return { dots: 1, trails: 1 };
  }

  global.TurnerRangelandMapCore = {
    SEX,
    mulberry32,
    escapeHtml,
    escapePlainField,
    pointInPoly,
    polygonBounds,
    randomInPoly,
    sampleBilinearField,
    pickWeightedPosition,
    closestPointOnSegment,
    distSqLngLat,
    buildPastureTrampleIndex,
    hashSeed,
    estimateBisonWeightLbs,
    labelTier,
    visualStride,
  };
})(typeof window !== 'undefined' ? window : globalThis);
