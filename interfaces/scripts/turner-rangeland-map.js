/**
 * Turner Enterprise Rangeland — passive radar map
 * Fence-line returns × satellite pass → one dot per bison at radar fidelity.
 */
(function (global) {
  'use strict';

  const SEX = { male: 0, female: 1, calf: 2 };
  const COLORS = ['#4a9eff', '#f472b6', '#fb923c'];
  const TRAIL = 'rgba(144, 238, 144, 0.45)';
  const TRAIL_LEN = 10;
  const MAP_W = 1000;
  const MAP_H = 620;

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0];
      const yi = poly[i][1];
      const xj = poly[j][0];
      const yj = poly[j][1];
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function pickWeightedPosition(weights, gridSize, poly, rng) {
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
    const r = rng();
    let acc = 0;
    for (let i = 0; i < weights.length; i++) {
      acc += weights[i];
      if (r <= acc || i === weights.length - 1) {
        const gx = i % gridSize;
        const gy = Math.floor(i / gridSize);
        const x = minX + ((gx + 0.5) / gridSize) * (maxX - minX);
        const y = minY + ((gy + 0.5) / gridSize) * (maxY - minY);
        if (pointInPoly(x, y, poly)) return { x, y };
        break;
      }
    }
    return randomInPoly(poly, rng);
  }

  function randomInPoly(poly, rng) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of poly) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]);
      maxY = Math.max(maxY, p[1]);
    }
    for (let i = 0; i < 80; i++) {
      const x = minX + rng() * (maxX - minX);
      const y = minY + rng() * (maxY - minY);
      if (pointInPoly(x, y, poly)) return { x, y };
    }
    const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    return { x: cx, y: cy };
  }

  function TurnerRangelandMap(rootEl, options) {
    this.root = rootEl;
    this.onDetail = options.onDetail || function () {};
    this.geo = null;
    this.stream = null;
    this.bison = [];
    this.zoom = { scale: 1, tx: 0, ty: 0, focus: null };
    this.drag = null;
    this.selected = null;
    this._raf = null;
    this._seed = 20260525;
    this._radar = null;
  }

  TurnerRangelandMap.prototype.load = async function () {
    this.root.innerHTML =
      '<p class="tb-hint">Passive radar lock — cross-referencing fence-line returns with satellite pass…</p>';
    const res = await fetch('/data/turner-rangeland-geography.json');
    if (!res.ok) throw new Error('Rangeland geography unavailable');
    this.geo = await res.json();
    await new Promise((r) => setTimeout(r, 0));
    this._buildHerd(null);
    this._renderShell();
    this._bind();
    this._draw();
  };

  TurnerRangelandMap.prototype._radarByPasture = function (radar) {
    const m = {};
    if (!radar?.pastures) return m;
    for (const p of radar.pastures) m[p.id] = p;
    return m;
  };

  TurnerRangelandMap.prototype._buildHerd = function (radar) {
    const g = this.geo;
    const total = g.totalHead || 45000;
    const seed = radar?.placementSeed ?? this._seed;
    const rng = mulberry32(seed);
    const radarPastures = this._radarByPasture(radar);
    const pastures = g.pastures;
    const ratio = g.sexRatio || { male: 0.38, female: 0.42, calf: 0.2 };
    const counts = {
      male: Math.floor(total * ratio.male),
      female: Math.floor(total * ratio.female),
      calf: total - Math.floor(total * ratio.male) - Math.floor(total * ratio.female),
    };
    const order = [];
    for (let i = 0; i < counts.male; i++) order.push(SEX.male);
    for (let i = 0; i < counts.female; i++) order.push(SEX.female);
    for (let i = 0; i < counts.calf; i++) order.push(SEX.calf);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const headByPasture = pastures.map((p) => ({
      pasture: p,
      count: Math.round(total * (p.headShare || 1 / pastures.length)),
    }));
    let assigned = headByPasture.reduce((s, h) => s + h.count, 0);
    while (assigned > total) {
      headByPasture[headByPasture.length - 1].count--;
      assigned--;
    }
    while (assigned < total) {
      headByPasture[0].count++;
      assigned++;
    }

    this.bison = [];
    let idx = 0;
    for (const block of headByPasture) {
      const poly = block.pasture.polygon;
      const rp = radarPastures[block.pasture.id];
      const gridSize = rp?.gridSize || 24;
      const weights = rp?.weights;

      for (let n = 0; n < block.count && idx < order.length; n++, idx++) {
        const pos = weights
          ? pickWeightedPosition(weights, gridSize, poly, rng)
          : randomInPoly(poly, rng);
        const trails = [];
        for (let t = 0; t < TRAIL_LEN; t++) {
          trails.push({
            x: pos.x + (rng() - 0.5) * 4 * t,
            y: pos.y + (rng() - 0.5) * 4 * t,
          });
        }
        this.bison.push({
          id: 'b-' + idx,
          x: pos.x,
          y: pos.y,
          sex: order[idx],
          pastureId: block.pasture.id,
          pastureName: block.pasture.name,
          trails,
        });
      }
    }
  };

  TurnerRangelandMap.prototype._renderShell = function () {
    const g = this.geo;
    const srcList = (g.dataSources || [])
      .map((s) => `<button type="button" class="tb-hud-chip tb-hud-chip--source" data-zoom="source" data-id="${s.id}">${s.name}</button>`)
      .join('');

    this.root.innerHTML = `
      <section class="tb-map-stage" aria-label="Passive radar Turner rangeland map">
        <p class="tb-radar-banner" id="tb-radar-banner">Passive radar · fence-line × satellite cross-reference · no collars</p>
        <div class="tb-map-hud tb-map-hud--top" role="toolbar" aria-label="Northern metrics">
          <button type="button" class="tb-hud-chip" data-zoom="radar"><span class="tb-hud-l">Radar fidelity</span><span class="tb-hud-v" id="tb-hud-fidelity">—</span><span class="tb-hud-s">fence × satellite</span></button>
          <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="flux"><span class="tb-hud-l">Solar flux</span><span class="tb-hud-v" id="tb-hud-flux">—</span><span class="tb-hud-s">NOAA · iono fix</span></button>
          <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="sunspot"><span class="tb-hud-l">Sunspots</span><span class="tb-hud-v" id="tb-hud-sunspot">—</span><span class="tb-hud-s">NOAA regions</span></button>
          <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="pll"><span class="tb-hud-l">Fence PLL</span><span class="tb-hud-v" id="tb-hud-pll">—</span><span class="tb-hud-s">1420 MHz transmit</span></button>
        </div>
        <div class="tb-map-body">
          <div class="tb-map-hud tb-map-hud--left" role="toolbar" aria-label="Western metrics">
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="heads"><span class="tb-hud-l">Bison</span><span class="tb-hud-v" id="tb-hud-heads">—</span><span class="tb-hud-s">TESF + wave-lock</span></button>
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="velocity"><span class="tb-hud-l">Grazing v</span><span class="tb-hud-v" id="tb-hud-velocity">—</span><span class="tb-hud-s">NSPFRNP cohort</span></button>
            <button type="button" class="tb-hud-chip" data-zoom="herd"><span class="tb-hud-l">Fleet map</span><span class="tb-hud-v">${(g.totalHead || 0).toLocaleString()}</span><span class="tb-hud-s">radar-placed dots</span></button>
          </div>
          <div class="tb-map-viewport" id="tb-map-viewport">
            <svg class="tb-map-svg" id="tb-map-svg" viewBox="0 0 ${MAP_W} ${MAP_H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <linearGradient id="tb-topo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#1a3d2e"/>
                  <stop offset="100%" stop-color="#0f261c"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#tb-topo-grad)"/>
              <g id="tb-topo-lines"></g>
              <g id="tb-power-lines"></g>
              <g id="tb-pastures"></g>
              <g id="tb-fences"></g>
            </svg>
            <canvas class="tb-map-canvas" id="tb-map-canvas" width="${MAP_W}" height="${MAP_H}"></canvas>
            <div class="tb-map-legend" aria-label="Legend">
              <span><i class="tb-dot tb-dot--male"></i> Male</span>
              <span><i class="tb-dot tb-dot--female"></i> Female</span>
              <span><i class="tb-dot tb-dot--calf"></i> Calf</span>
              <span><i class="tb-trail-swatch"></i> Radar trace</span>
              <span><i class="tb-power-swatch"></i> Transmission (HIFLD)</span>
            </div>
            <button type="button" class="tb-map-reset" id="tb-map-reset" hidden>Network view</button>
          </div>
          <div class="tb-map-hud tb-map-hud--right" role="toolbar" aria-label="Eastern metrics">
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="kp"><span class="tb-hud-l">Kp floor</span><span class="tb-hud-v" id="tb-hud-kp">—</span><span class="tb-hud-s">NOAA · EGS φ</span></button>
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="forage"><span class="tb-hud-l">Forage / day</span><span class="tb-hud-v" id="tb-hud-forage">—</span><span class="tb-hud-s">TIE ADM</span></button>
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="adm"><span class="tb-hud-l">ADM</span><span class="tb-hud-v" id="tb-hud-adm">—</span><span class="tb-hud-s">Turner Institute</span></button>
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="magnetic"><span class="tb-hud-l">Magnetic</span><span class="tb-hud-v" id="tb-hud-mag">—</span><span class="tb-hud-s">NOAA K·Dst·Bz</span></button>
            <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="grid"><span class="tb-hud-l">Grid lines</span><span class="tb-hud-v" id="tb-hud-grid">—</span><span class="tb-hud-s">HIFLD ≥69 kV</span></button>
          </div>
        </div>
        <div class="tb-map-hud tb-map-hud--bottom" role="toolbar" aria-label="Data sources">
          <span class="tb-hud-title">Sources · click to zoom</span>
          ${srcList}
          <button type="button" class="tb-hud-chip" data-zoom="metric" data-key="acres"><span class="tb-hud-l">Rangeland</span><span class="tb-hud-v" id="tb-hud-acres">—</span><span class="tb-hud-s">Turner Enterprise</span></button>
        </div>
        <aside class="tb-map-detail" id="tb-map-detail" hidden>
          <button type="button" class="tb-map-detail-close" id="tb-map-detail-close" aria-label="Close detail">×</button>
          <h3 id="tb-map-detail-title">—</h3>
          <p class="tb-map-detail-sub" id="tb-map-detail-sub"></p>
          <div id="tb-map-detail-body"></div>
        </aside>
      </section>
    `;

    this.viewport = this.root.querySelector('#tb-map-viewport');
    this.svg = this.root.querySelector('#tb-map-svg');
    this.canvas = this.root.querySelector('#tb-map-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.detailEl = this.root.querySelector('#tb-map-detail');
    this._drawPastures();
    this._drawTopo();
  };

  TurnerRangelandMap.prototype._drawTopo = function () {
    const g = this.root.querySelector('#tb-topo-lines');
    const lines = [];
    for (let y = 0; y < MAP_H; y += 40) {
      let d = `M 0 ${y + 8 * Math.sin(y / 90)}`;
      for (let x = 0; x <= MAP_W; x += 40) {
        d += ` L ${x} ${y + 12 * Math.sin((x + y) / 70)}`;
      }
      lines.push(`<path d="${d}" fill="none" stroke="rgba(120,180,140,0.12)" stroke-width="1"/>`);
    }
    g.innerHTML = lines.join('');
  };

  TurnerRangelandMap.prototype._drawPowerLines = function (segments) {
    const g = this.root.querySelector('#tb-power-lines');
    if (!g) return;
    if (!segments?.length) {
      g.innerHTML = '';
      return;
    }
    let html = '';
    for (const seg of segments) {
      const pts = (seg.points || []).map((p) => `${p.x},${p.y}`).join(' ');
      if (pts.length < 3) continue;
      const kv = seg.voltageKv || 115;
      const hi = kv >= 345 ? ' tb-power-line--hv' : kv >= 230 ? ' tb-power-line--mv' : '';
      html += `<polyline class="tb-power-line${hi}" points="${pts}" data-zoom="grid"/>`;
    }
    g.innerHTML = html;
  };

  TurnerRangelandMap.prototype._drawPastures = function () {
    const g = this.root.querySelector('#tb-pastures');
    const f = this.root.querySelector('#tb-fences');
    let pastures = '';
    let fences = '';
    for (const p of this.geo.pastures) {
      const pts = p.polygon.map((c) => c.join(',')).join(' ');
      const cx = p.polygon.reduce((s, c) => s + c[0], 0) / p.polygon.length;
      const cy = p.polygon.reduce((s, c) => s + c[1], 0) / p.polygon.length;
      pastures += `<polygon class="tb-pasture" data-pasture-id="${p.id}" data-zoom="pasture" points="${pts}" tabindex="0" role="button" aria-label="${p.name} pasture"/>`;
      pastures += `<text class="tb-pasture-label" x="${cx}" y="${cy}" text-anchor="middle" pointer-events="none">${p.name}</text>`;
      fences += `<polygon class="tb-fence" points="${pts}" fill="none"/>`;
    }
    g.innerHTML = pastures;
    f.innerHTML = fences;
  };

  TurnerRangelandMap.prototype._bind = function () {
    const self = this;
    this.root.querySelector('#tb-map-reset').addEventListener('click', () => self.resetZoom());
    this.root.querySelector('#tb-map-detail-close').addEventListener('click', () => self._hideDetail());

    this.root.querySelectorAll('[data-zoom]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const z = el.getAttribute('data-zoom');
        if (z === 'pasture') {
          const id = el.getAttribute('data-pasture-id');
          self.zoomToPasture(id);
          self._showPastureDetail(id);
        } else if (z === 'source') {
          self._showSourceDetail(el.getAttribute('data-id'));
        } else if (z === 'metric') {
          self._showMetricDetail(el.getAttribute('data-key'));
        } else if (z === 'herd') {
          self.resetZoom();
          self._showHerdDetail();
        } else if (z === 'radar') {
          self._showRadarDetail();
        }
      });
    });

    this.canvas.addEventListener('click', (e) => self._onCanvasClick(e));
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      self._applyZoomAt(delta, e.offsetX, e.offsetY);
    }, { passive: false });

    let panStart = null;
    this.viewport.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.tb-hud-chip')) return;
      panStart = { x: e.clientX, y: e.clientY, tx: self.zoom.tx, ty: self.zoom.ty };
      self.viewport.setPointerCapture(e.pointerId);
    });
    this.viewport.addEventListener('pointermove', (e) => {
      if (!panStart) return;
      const rect = self.viewport.getBoundingClientRect();
      const scale = self._displayScale();
      self.zoom.tx = panStart.tx + (e.clientX - panStart.x) / scale;
      self.zoom.ty = panStart.ty + (e.clientY - panStart.y) / scale;
      self._draw();
    });
    this.viewport.addEventListener('pointerup', () => {
      panStart = null;
    });
  };

  TurnerRangelandMap.prototype._displayScale = function () {
    const rect = this.viewport.getBoundingClientRect();
    return Math.min(rect.width / MAP_W, rect.height / MAP_H) * this.zoom.scale;
  };

  TurnerRangelandMap.prototype._mapPointFromEvent = function (e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = MAP_W / rect.width;
    const sy = MAP_H / rect.height;
    const mx = (e.clientX - rect.left) * sx;
    const my = (e.clientY - rect.top) * sy;
    return {
      x: (mx - this.zoom.tx) / this.zoom.scale,
      y: (my - this.zoom.ty) / this.zoom.scale,
    };
  };

  TurnerRangelandMap.prototype._onCanvasClick = function (e) {
    const p = this._mapPointFromEvent(e);
    let best = null;
    let bestD = 12 / this.zoom.scale;
    for (const b of this.bison) {
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    if (best) {
      this.zoomToPoint(best.x, best.y, 4);
      this._showBisonDetail(best);
      return;
    }
    for (const pasture of this.geo.pastures) {
      if (pointInPoly(p.x, p.y, pasture.polygon)) {
        this.zoomToPasture(pasture.id);
        this._showPastureDetail(pasture.id);
        return;
      }
    }
    if (this._nearTrail(p)) {
      this._showTrailDetail(p);
    }
  };

  TurnerRangelandMap.prototype._nearTrail = function (p) {
    const thresh = 8 / this.zoom.scale;
    for (const b of this.bison) {
      for (const t of b.trails) {
        if (Math.hypot(t.x - p.x, t.y - p.y) < thresh) return true;
      }
    }
    return false;
  };

  TurnerRangelandMap.prototype._showTrailDetail = function (p) {
    const html = `
      <p>Light green traces = migratory paths · pheromone-trail analog in NSPFRNP passive grid.</p>
      <ul class="tb-detail-list">
        <li><strong>Drift</strong> Grazing velocity + PLL wire (${this.stream?.ingest?.pllProxy?.toFixed(3) ?? '—'})</li>
        <li><strong>Sources</strong> Fence radar trace · satellite pass · NOAA Kp correction</li>
      </ul>`;
    this._showDetail('Migratory path', `Grid (${p.x.toFixed(0)}, ${p.y.toFixed(0)}) · click a bison dot to zoom individual`, html);
  };

  TurnerRangelandMap.prototype.zoomToPasture = function (id) {
    const p = this.geo.pastures.find((x) => x.id === id);
    if (!p) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const c of p.polygon) {
      minX = Math.min(minX, c[0]);
      maxX = Math.max(maxX, c[0]);
      minY = Math.min(minY, c[1]);
      maxY = Math.max(maxY, c[1]);
    }
    const pad = 30;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    const scale = Math.min(MAP_W / w, MAP_H / h) * 0.85;
    this.zoom = {
      scale,
      tx: -(minX - pad) * scale + (MAP_W - w * scale) / 2,
      ty: -(minY - pad) * scale + (MAP_H - h * scale) / 2,
      focus: id,
    };
    this.root.querySelector('#tb-map-reset').hidden = false;
    this._draw();
  };

  TurnerRangelandMap.prototype.zoomToPoint = function (x, y, factor) {
    const f = factor || 3;
    this.zoom.scale = Math.min(12, this.zoom.scale * f);
    this.zoom.tx = MAP_W / 2 - x * this.zoom.scale;
    this.zoom.ty = MAP_H / 2 - y * this.zoom.scale;
    this.root.querySelector('#tb-map-reset').hidden = false;
    this._draw();
  };

  TurnerRangelandMap.prototype._applyZoomAt = function (factor, ox, oy) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = MAP_W / rect.width;
    const sy = MAP_H / rect.height;
    const mx = ox * sx;
    const my = oy * sy;
    const wx = (mx - this.zoom.tx) / this.zoom.scale;
    const wy = (my - this.zoom.ty) / this.zoom.scale;
    this.zoom.scale = Math.max(0.6, Math.min(14, this.zoom.scale * factor));
    this.zoom.tx = mx - wx * this.zoom.scale;
    this.zoom.ty = my - wy * this.zoom.scale;
    this.root.querySelector('#tb-map-reset').hidden = this.zoom.scale <= 1.05;
    this._draw();
  };

  TurnerRangelandMap.prototype.resetZoom = function () {
    this.zoom = { scale: 1, tx: 0, ty: 0, focus: null };
    this.root.querySelector('#tb-map-reset').hidden = true;
    this._draw();
  };

  TurnerRangelandMap.prototype.updateStream = function (stream) {
    this.stream = stream;
    if (!stream) return;

    if (stream.radar && stream.radar.placementSeed !== this._radar?.placementSeed) {
      this._radar = stream.radar;
      this._buildHerd(stream.radar);
    }

    const banner = this.root.querySelector('#tb-radar-banner');
    if (stream.powerGrid?.mapSegments || stream.radar?.powerGridChannel?.mapSegments) {
      this._drawPowerLines(
        stream.powerGrid?.mapSegments || stream.radar.powerGridChannel.mapSegments,
      );
    }

    if (banner && stream.radar) {
      const lines = stream.powerGrid?.lineCount ?? stream.radar.powerGridChannel?.lineCount ?? 0;
      const mag = stream.magnetic?.couplingIndex ?? stream.radar.magneticChannel?.couplingIndex;
      banner.textContent = `Passive radar locked · ${stream.radar.fidelityPct}% fidelity · fence × satellite × magnetic${mag != null ? ` (${mag})` : ''} · ${lines} grid corridors`;
    }

    const drift = ((stream.ingest?.pllProxy ?? 0.5) - 0.5) * 0.35;
    const v = stream.baseline?.velocityKmh ?? 0.38;
    const rng = mulberry32(Math.floor(Date.now() / 45000));
    for (const b of this.bison) {
      const last = b.trails[b.trails.length - 1];
      const nx = b.x + (rng() - 0.5) * v * 0.08 + drift;
      const ny = b.y + (rng() - 0.5) * v * 0.08;
      const pasture = this.geo.pastures.find((p) => p.id === b.pastureId);
      if (pasture && pointInPoly(nx, ny, pasture.polygon)) {
        b.trails.push({ x: nx, y: ny });
        if (b.trails.length > TRAIL_LEN) b.trails.shift();
        b.x = nx;
        b.y = ny;
      }
    }
    this._fillHud(stream);
    this._draw();
  };

  TurnerRangelandMap.prototype._fillHud = function (stream) {
    const set = (id, v) => {
      const el = this.root.querySelector(id);
      if (el) el.textContent = v;
    };
    const b = stream.baseline || {};
    const live = stream.live || {};
    set('#tb-hud-flux', live.fluxSfu != null ? live.fluxSfu + ' sfu' : '—');
    set('#tb-hud-sunspot', live.sunspotCount != null ? String(live.sunspotCount) : '—');
    set('#tb-hud-kp', live.kp != null ? String(live.kp) : '—');
    const pllUs = stream.ingest?.pllMicroseconds;
    set(
      '#tb-hud-pll',
      pllUs != null ? `${Number(pllUs).toFixed(1)} µs` : stream.ingest?.pllProxy != null ? stream.ingest.pllProxy.toFixed(3) : '—'
    );
    set('#tb-hud-heads', (b.headCount || this.geo.totalHead).toLocaleString());
    set('#tb-hud-velocity', b.velocityMph != null ? b.velocityMph + ' mph' : '—');
    set('#tb-hud-forage', b.dailyForageTons != null ? b.dailyForageTons + ' t' : '—');
    set('#tb-hud-adm', b.admLbsPerAcre != null ? b.admLbsPerAcre + ' lb/ac' : '—');
    set('#tb-hud-acres', b.canvasAcres != null ? (b.canvasAcres / 1e6).toFixed(1) + 'M ac' : '—');
    set('#tb-hud-fidelity', stream.radar?.fidelityPct != null ? stream.radar.fidelityPct + '%' : '—');
    const mag = stream.magnetic || stream.radar?.magneticChannel;
    set(
      '#tb-hud-mag',
      mag?.couplingIndex != null ? String(mag.couplingIndex) : mag?.boulderK != null ? `K ${mag.boulderK}` : '—'
    );
    const pg = stream.powerGrid || stream.radar?.powerGridChannel;
    set('#tb-hud-grid', pg?.lineCount != null ? String(pg.lineCount) : '—');
  };

  TurnerRangelandMap.prototype._draw = function () {
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => this._paint());
  };

  TurnerRangelandMap.prototype._paint = function () {
    const ctx = this.ctx;
    const z = this.zoom;
    ctx.clearRect(0, 0, MAP_W, MAP_H);
    ctx.save();
    ctx.translate(z.tx, z.ty);
    ctx.scale(z.scale, z.scale);

    const focusPasture = z.focus;
    const trailW = Math.max(0.4, 1.2 / z.scale);
    const dotR = Math.max(0.35, 1.1 / z.scale);

    for (const b of this.bison) {
      if (focusPasture && b.pastureId !== focusPasture) continue;
      const trail = b.trails;
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = TRAIL;
        ctx.lineWidth = trailW;
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
    }

    for (const b of this.bison) {
      if (focusPasture && b.pastureId !== focusPasture) continue;
      ctx.fillStyle = COLORS[b.sex];
      ctx.beginPath();
      ctx.arc(b.x, b.y, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const labels = this.root.querySelectorAll('.tb-pasture');
    labels.forEach((poly) => {
      poly.classList.toggle('tb-pasture--focus', poly.getAttribute('data-pasture-id') === focusPasture);
    });
  };

  TurnerRangelandMap.prototype._showDetail = function (title, sub, html) {
    this.detailEl.hidden = false;
    this.root.querySelector('#tb-map-detail-title').textContent = title;
    this.root.querySelector('#tb-map-detail-sub').textContent = sub || '';
    this.root.querySelector('#tb-map-detail-body').innerHTML = html;
    this.onDetail({ title, sub, html });
  };

  TurnerRangelandMap.prototype._hideDetail = function () {
    this.detailEl.hidden = true;
  };

  TurnerRangelandMap.prototype._showBisonDetail = function (b) {
    const sex = ['Male', 'Female', 'Calf'][b.sex];
    const s = this.stream;
    const html = `
      <ul class="tb-detail-list">
        <li><strong>ID</strong> ${b.id} · ${sex}</li>
        <li><strong>Pasture</strong> ${b.pastureName}</li>
        <li><strong>Position</strong> wave-lock grid (${b.x.toFixed(1)}, ${b.y.toFixed(1)})</li>
        <li><strong>Trail</strong> ${b.trails.length} samples · pheromone-trail analog</li>
        <li><strong>Sources</strong> NSPFRNP fence-line PLL · NOAA Kp/flux · TESF mass profile</li>
      </ul>`;
    this._showDetail(sex + ' bison · ' + b.pastureName, 'Passive positioning · no GPS collar', html);
  };

  TurnerRangelandMap.prototype._showPastureDetail = function (id) {
    const p = this.geo.pastures.find((x) => x.id === id);
    const count = this.bison.filter((b) => b.pastureId === id).length;
    const html = `
      <ul class="tb-detail-list">
        <li><strong>State</strong> ${p.state}</li>
        <li><strong>Acres</strong> ${(p.acres || 0).toLocaleString()}</li>
        <li><strong>Head on map</strong> ${count.toLocaleString()}</li>
        <li><strong>Gates / rotation</strong> ${(p.gates || []).join(' · ') || 'Turner Institute public notes'}</li>
        <li><strong>Source</strong> Turner Institute of Ecoagriculture · NSPFRNP reconciliation</li>
      </ul>`;
    this._showDetail(p.name, 'Radar-fused pasture · click dots for individual returns', html);
  };

  TurnerRangelandMap.prototype._showSourceDetail = function (id) {
    const src = (this.geo.dataSources || []).find((x) => x.id === id);
    if (!src) return;
    const feeds = (src.feeds || []).map((f) => `<li>${f}</li>`).join('');
    const html = `<p>${src.role || ''}</p><ul class="tb-detail-list">${feeds}</ul>`;
    this._showDetail(src.name, 'Named data source · click pastures or bison to cross-check', html);
  };

  TurnerRangelandMap.prototype._showMetricDetail = function (key) {
    const s = this.stream;
    const b = (s && s.baseline) || {};
    const live = (s && s.live) || {};
    const pllUs = s?.ingest?.pllMicroseconds;
    const map = {
      flux: ['Solar radio flux', live.fluxSfu + ' sfu', 'NOAA SWPC · ionospheric correction before radar fuse'],
      sunspot: ['Sunspot regions', String(live.sunspotCount), 'NOAA SWPC · solar_regions.json'],
      kp: ['Planetary K-index', String(live.kp), 'NOAA SWPC · EGS φ 1.618 · Goubau noise floor'],
      pll: ['Fence PLL return', pllUs != null ? `${Number(pllUs).toFixed(1)} µs` : '—', 'OpenWebRX · 1420 MHz fence transmit/receive'],
      heads: ['Bison footprint', (b.headCount || 45000).toLocaleString(), 'TESF · radar-placed fleet map'],
      velocity: ['Grazing velocity', (b.velocityMph || '—') + ' mph', 'Registry baseline · fence-line cohort'],
      forage: ['Daily forage', (b.dailyForageTons || '—') + ' tons', 'Turner Institute ADM · metabolic 2.6%'],
      adm: ['ADM yield', (b.admLbsPerAcre || '—') + ' lb/acre', 'Turner Institute of Ecoagriculture'],
      acres: ['Rangeland canvas', (b.canvasAcres || 2000000).toLocaleString() + ' acres', 'Turner Enterprise Contiguous Land Network'],
    };
    const row = map[key] || ['Metric', '—', ''];
    this._showDetail(row[0], row[2], `<p class="tb-metric-big">${row[1]}</p>`);
  };

  TurnerRangelandMap.prototype._showRadarDetail = function () {
    const r = this.stream?.radar;
    const html = r
      ? `<p>${r.analogy || ''}</p>
         <ul class="tb-detail-list">
           <li><strong>Fidelity</strong> ${r.fidelityPct}%</li>
           <li><strong>Mean correlation</strong> ${r.correlationMean ?? '—'}</li>
           <li><strong>Fence channel</strong> ${this.stream?.radarFence || '1420 MHz perimeter PLL gates'}</li>
           <li><strong>Satellite channel</strong> ${this.stream?.radarSatellite || 'Open-Meteo soil moisture pass'}</li>
           <li><strong>Magnetic layers</strong> ${r.magneticChannel?.label || 'NOAA SWPC'} · coupling ${r.magneticChannel?.couplingIndex ?? '—'}</li>
           <li><strong>Power grid</strong> ${r.powerGridChannel?.label || 'HIFLD'} · ${r.powerGridChannel?.lineCount ?? 0} lines · grid res ${r.gridResolution ?? '—'}</li>
         </ul>`
      : '<p>Awaiting radar fuse from telemetry…</p>';
    this._showDetail('Passive radar synthesis', 'Fence-line returns × satellite pass', html);
  };

  TurnerRangelandMap.prototype._showHerdDetail = function () {
    const r = this.stream?.radar;
    const html = `
      <p>${this.bison.length.toLocaleString()} dots — one per head — placed by passive radar fusion (blue male, pink female, orange calf).</p>
      <p>The system operates like radar: the fence grid transmits along the perimeter; satellite soil-moisture returns are cross-referenced with PLL gate returns to fix each animal at ${r?.fidelityPct ?? '—'}% fidelity. Light green traces are radar migratory paths. No GPS collars.</p>
      <ul class="tb-detail-list">
        <li>Fence-line radar · OpenWebRX 1420 MHz</li>
        <li>Open-Meteo Satellite API</li>
        <li>NOAA SWPC · ionospheric correction</li>
        <li>Turner Institute of Ecoagriculture · Turner Endangered Species Fund</li>
      </ul>`;
    this._showDetail('Full Turner herd · radar map', '1 dot per bison · click any dot to zoom', html);
  };

  global.TurnerRangelandMap = TurnerRangelandMap;
})(typeof window !== 'undefined' ? window : globalThis);
