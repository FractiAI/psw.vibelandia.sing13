/**
 * Turner Enterprise Rangelands — passive radar chart (single canvas, unified camera).
 */
(function (global) {
  'use strict';

  const MAP_W = 1000;
  const MAP_H = 620;
  const SEX = { male: 0, female: 1, calf: 2 };
  const COLORS = ['#5eb3ff', '#f472b6', '#fb923c'];
  const TRAIL_CORE = 'rgba(144, 238, 144, 0.82)';
  const TRAIL_GLOW = 'rgba(100, 220, 130, 0.28)';
  const TRAIL_LEN = 12;

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

  function buildTrails(pos, poly, rng) {
    const trails = [{ x: pos.x, y: pos.y }];
    let x = pos.x;
    let y = pos.y;
    for (let t = 1; t < TRAIL_LEN; t++) {
      x += (rng() - 0.5) * 6;
      y += (rng() - 0.5) * 6;
      if (!pointInPoly(x, y, poly)) {
        x = pos.x + (rng() - 0.5) * 4 * t;
        y = pos.y + (rng() - 0.5) * 4 * t;
      }
      trails.push({ x, y });
    }
    return trails;
  }

  function labelTier(scale) {
    if (scale >= 8) return 3;
    if (scale >= 3) return 2;
    if (scale >= 1.4) return 1;
    return 0;
  }

  function TurnerRangelandMap(rootEl) {
    this.root = rootEl;
    this.geo = null;
    this.stream = null;
    this.bison = [];
    this._radar = null;
    this._powerSegments = [];
    this.cam = { scale: 1, tx: 0, ty: 0 };
    this.focusPasture = null;
    this.drag = null;
    this.canvas = null;
    this.ctx = null;
    this.dpr = 1;
  }

  TurnerRangelandMap.prototype.load = async function () {
    this.root.innerHTML = '<p class="tb-hint">Loading rangeland chart…</p>';
    const res = await fetch('/data/turner-rangeland-geography.json');
    if (!res.ok) throw new Error('Geography unavailable');
    this.geo = await res.json();
    this._buildHerd(null);
    this._renderChrome();
    this._bind();
    this.fitNetwork();
    this.render();
  };

  TurnerRangelandMap.prototype._radarByPasture = function (radar) {
    const m = {};
    if (radar?.pastures) for (const p of radar.pastures) m[p.id] = p;
    return m;
  };

  TurnerRangelandMap.prototype._buildHerd = function (radar) {
    const g = this.geo;
    const total = g.totalHead || 45000;
    const rng = mulberry32(radar?.placementSeed ?? 20260525);
    const radarPastures = this._radarByPasture(radar);
    const ratio = g.sexRatio || { male: 0.38, female: 0.42, calf: 0.2 };
    const order = [];
    const nM = Math.floor(total * ratio.male);
    const nF = Math.floor(total * ratio.female);
    for (let i = 0; i < nM; i++) order.push(SEX.male);
    for (let i = 0; i < nF; i++) order.push(SEX.female);
    for (let i = 0; i < total - nM - nF; i++) order.push(SEX.calf);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const blocks = g.pastures.map((p) => ({
      pasture: p,
      count: Math.round(total * (p.headShare || 1 / g.pastures.length)),
    }));
    let sum = blocks.reduce((s, b) => s + b.count, 0);
    while (sum > total) {
      blocks[blocks.length - 1].count--;
      sum--;
    }
    while (sum < total) {
      blocks[0].count++;
      sum++;
    }

    this.bison = [];
    let idx = 0;
    for (const block of blocks) {
      const poly = block.pasture.polygon;
      const rp = radarPastures[block.pasture.id];
      for (let n = 0; n < block.count && idx < order.length; n++, idx++) {
        const pos = rp?.weights
          ? pickWeightedPosition(rp.weights, rp.gridSize || 24, poly, rng)
          : randomInPoly(poly, rng);
        this.bison.push({
          id: 'b-' + idx,
          x: pos.x,
          y: pos.y,
          sex: order[idx],
          pastureId: block.pasture.id,
          pastureName: block.pasture.name,
          trails: buildTrails(pos, poly, rng),
        });
      }
    }
  };

  TurnerRangelandMap.prototype._renderChrome = function () {
    const g = this.geo;
    const metrics = [
      ['fidelity', 'Radar fidelity', 'tb-m-fidelity'],
      ['heads', 'Bison', 'tb-m-heads'],
      ['flux', 'Solar flux', 'tb-m-flux'],
      ['kp', 'Kp', 'tb-m-kp'],
      ['mag', 'Magnetic', 'tb-m-mag'],
      ['grid', 'Grid lines', 'tb-m-grid'],
    ];
    const metricHtml = metrics
      .map(
        ([k, label, id]) =>
          `<button type="button" class="tb-metric" data-metric="${k}"><span class="tb-metric-k">${label}</span><span class="tb-metric-v" id="${id}">—</span></button>`,
      )
      .join('');

    this.root.innerHTML = `
      <section class="tb-chart" aria-label="Passive radar rangeland chart">
        <header class="tb-chart-head">
          <div>
            <h2 class="tb-chart-title">Passive radar topological chart</h2>
            <p class="tb-chart-sub" id="tb-chart-sub">${escapeHtml(g.networkLabel || '')} · scroll to zoom · drag to pan</p>
          </div>
          <div class="tb-chart-actions">
            <button type="button" class="tb-chart-btn" id="tb-zoom-out" title="Zoom out">−</button>
            <button type="button" class="tb-chart-btn" id="tb-zoom-in" title="Zoom in">+</button>
            <button type="button" class="tb-chart-btn" id="tb-fit" title="Full network">Fit</button>
          </div>
        </header>
        <div class="tb-metric-strip" role="group" aria-label="Live metrics">${metricHtml}</div>
        <div class="tb-chart-stage">
          <canvas class="tb-chart-canvas" id="tb-chart-canvas" aria-label="Rangeland map"></canvas>
          <div class="tb-chart-legend">
            <span><i class="swatch swatch-male"></i>Male</span>
            <span><i class="swatch swatch-female"></i>Female</span>
            <span><i class="swatch swatch-calf"></i>Calf</span>
            <span><i class="swatch swatch-trail"></i>Pheromone trail</span>
            <span><i class="swatch swatch-power"></i>Transmission</span>
          </div>
          <aside class="tb-chart-panel" id="tb-chart-panel" hidden>
            <button type="button" class="tb-chart-panel-x" id="tb-chart-panel-x" aria-label="Close">×</button>
            <h3 id="tb-panel-title"></h3>
            <p id="tb-panel-sub"></p>
            <div id="tb-panel-body"></div>
          </aside>
        </div>
        <p class="tb-chart-status" id="tb-chart-status" aria-live="polite">Awaiting telemetry…</p>
      </section>
    `;

    this.stage = this.root.querySelector('.tb-chart-stage');
    this.canvas = this.root.querySelector('#tb-chart-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this._resizeCanvas();
    window.addEventListener('resize', () => {
      this._resizeCanvas();
      this.render();
    });
  };

  TurnerRangelandMap.prototype._resizeCanvas = function () {
    if (!this.canvas || !this.stage) return;
    const rect = this.stage.getBoundingClientRect();
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(rect.width * this.dpr);
    this.canvas.height = Math.floor(rect.height * this.dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.viewW = rect.width;
    this.viewH = rect.height;
  };

  TurnerRangelandMap.prototype._bind = function () {
    const self = this;
    this.root.querySelector('#tb-zoom-in').addEventListener('click', () => {
      self.zoomAt(self.viewW / 2, self.viewH / 2, 1.25);
    });
    this.root.querySelector('#tb-zoom-out').addEventListener('click', () => {
      self.zoomAt(self.viewW / 2, self.viewH / 2, 0.8);
    });
    this.root.querySelector('#tb-fit').addEventListener('click', () => self.fitNetwork());
    this.root.querySelector('#tb-chart-panel-x').addEventListener('click', () => self._hidePanel());

    this.root.querySelectorAll('[data-metric]').forEach((btn) => {
      btn.addEventListener('click', () => self._showMetric(btn.getAttribute('data-metric')));
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const p = self._eventPoint(e);
      self.zoomAt(p.x, p.y, e.deltaY > 0 ? 0.9 : 1.1);
    }, { passive: false });

    this.canvas.addEventListener('pointerdown', (e) => {
      self.drag = { x: e.clientX, y: e.clientY, tx: self.cam.tx, ty: self.cam.ty };
      self.canvas.setPointerCapture(e.pointerId);
    });
    this.canvas.addEventListener('pointermove', (e) => {
      if (!self.drag) return;
      self.cam.tx = self.drag.tx + (e.clientX - self.drag.x);
      self.cam.ty = self.drag.ty + (e.clientY - self.drag.y);
      self.render();
    });
    this.canvas.addEventListener('pointerup', () => {
      self.drag = null;
    });
    this.canvas.addEventListener('click', (e) => self._onClick(e));
  };

  TurnerRangelandMap.prototype._eventPoint = function (e) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  TurnerRangelandMap.prototype.screenToWorld = function (sx, sy) {
    return {
      x: (sx - this.cam.tx) / this.cam.scale,
      y: (sy - this.cam.ty) / this.cam.scale,
    };
  };

  TurnerRangelandMap.prototype.zoomAt = function (sx, sy, factor) {
    const w = this.screenToWorld(sx, sy);
    this.cam.scale = Math.max(0.35, Math.min(18, this.cam.scale * factor));
    this.cam.tx = sx - w.x * this.cam.scale;
    this.cam.ty = sy - w.y * this.cam.scale;
    this.render();
  };

  TurnerRangelandMap.prototype.fitNetwork = function () {
    const pad = 24;
    const sx = (this.viewW - pad * 2) / MAP_W;
    const sy = (this.viewH - pad * 2) / MAP_H;
    this.cam.scale = Math.min(sx, sy);
    this.cam.tx = (this.viewW - MAP_W * this.cam.scale) / 2;
    this.cam.ty = (this.viewH - MAP_H * this.cam.scale) / 2;
    this.focusPasture = null;
    this.render();
  };

  TurnerRangelandMap.prototype.fitPasture = function (id) {
    const p = this.geo.pastures.find((x) => x.id === id);
    if (!p) return;
    const b = polygonBounds(p.polygon);
    const pad = 28;
    const pw = b.maxX - b.minX + pad * 2;
    const ph = b.maxY - b.minY + pad * 2;
    const sx = (this.viewW * 0.92) / pw;
    const sy = (this.viewH * 0.88) / ph;
    this.cam.scale = Math.min(sx, sy, 14);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    this.cam.tx = this.viewW / 2 - cx * this.cam.scale;
    this.cam.ty = this.viewH / 2 - cy * this.cam.scale;
    this.focusPasture = id;
    this.render();
  };

  TurnerRangelandMap.prototype.visibleWorld = function () {
    const x0 = this.screenToWorld(0, 0);
    const x1 = this.screenToWorld(this.viewW, this.viewH);
    return {
      minX: Math.min(x0.x, x1.x),
      maxX: Math.max(x0.x, x1.x),
      minY: Math.min(x0.y, x1.y),
      maxY: Math.max(x0.y, x1.y),
    };
  };

  TurnerRangelandMap.prototype.render = function () {
    if (!this.ctx || !this.geo) return;
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0a1812';
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    ctx.save();
    ctx.translate(this.cam.tx, this.cam.ty);
    ctx.scale(this.cam.scale, this.cam.scale);

    const tier = labelTier(this.cam.scale);
    const vb = this.visibleWorld();
    const focus = this.focusPasture;

    this._paintTopo(ctx);
    this._paintPastures(ctx, tier, focus);
    this._paintPower(ctx, tier, focus);
    this._paintTrails(ctx, vb, focus);
    this._paintBison(ctx, vb, focus);
    this._paintLabels(ctx, tier, focus);

    ctx.restore();

    const sub = this.root.querySelector('#tb-chart-sub');
    if (sub) {
      const z = (this.cam.scale * 100) | 0;
      sub.textContent = `${this.geo.networkLabel} · zoom ${z}%${focus ? ' · ' + (this.geo.pastures.find((p) => p.id === focus)?.name || '') : ''} · scroll zoom · drag pan`;
    }
  };

  TurnerRangelandMap.prototype._paintTopo = function (ctx) {
    ctx.strokeStyle = 'rgba(90, 140, 110, 0.14)';
    ctx.lineWidth = 1;
    for (let y = 0; y < MAP_H; y += 36) {
      ctx.beginPath();
      for (let x = 0; x <= MAP_W; x += 36) {
        const py = y + 10 * Math.sin((x + y) / 55);
        if (x === 0) ctx.moveTo(x, py);
        else ctx.lineTo(x, py);
      }
      ctx.stroke();
    }
    if (labelTier(this.cam.scale) === 0) {
      ctx.fillStyle = 'rgba(168, 181, 160, 0.75)';
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      ctx.fillText('Topographic relief', 12, 52);
      ctx.fillText('West', 14, MAP_H - 10);
      ctx.textAlign = 'right';
      ctx.fillText('East', MAP_W - 14, MAP_H - 10);
      ctx.textAlign = 'left';
    }
  };

  TurnerRangelandMap.prototype._paintPastures = function (ctx, tier, focus) {
    for (const p of this.geo.pastures) {
      if (focus && p.id !== focus) {
        ctx.globalAlpha = 0.12;
      } else {
        ctx.globalAlpha = 1;
      }
      const poly = p.polygon;
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i][0], poly[i][1]);
      ctx.closePath();
      ctx.fillStyle = focus && p.id === focus ? 'rgba(60, 120, 90, 0.42)' : 'rgba(45, 95, 72, 0.32)';
      ctx.fill();
      ctx.strokeStyle = p.id === focus ? 'rgba(196, 168, 116, 0.9)' : 'rgba(196, 168, 116, 0.45)';
      ctx.lineWidth = p.id === focus ? 2.2 : 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (tier >= 0 && (!focus || p.id === focus)) {
        const cx = poly.reduce((s, c) => s + c[0], 0) / poly.length;
        const cy = poly.reduce((s, c) => s + c[1], 0) / poly.length;
        const heads = this.bison.filter((b) => b.pastureId === p.id).length;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8f6f0';
        ctx.font = `700 ${Math.max(10, 13 / this.cam.scale)}px Libre Baskerville, Georgia, serif`;
        ctx.fillText(p.name, cx, cy - 6 / this.cam.scale);
        if (tier >= 1) {
          ctx.font = `500 ${Math.max(8, 10 / this.cam.scale)}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = '#d4edc8';
          ctx.fillText(`${p.state} · ${heads.toLocaleString()} head`, cx, cy + 8 / this.cam.scale);
        }
        if (tier >= 2) {
          ctx.fillText(`${(p.acres || 0).toLocaleString()} acres`, cx, cy + 20 / this.cam.scale);
        }
      }
    }
  };

  TurnerRangelandMap.prototype._paintPower = function (ctx, tier, focus) {
    for (const seg of this._powerSegments) {
      if (focus && seg.pastureId && seg.pastureId !== focus) continue;
      const pts = seg.points || [];
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      const kv = seg.voltageKv || 115;
      ctx.strokeStyle = kv >= 345 ? 'rgba(255, 120, 90, 0.75)' : 'rgba(255, 180, 70, 0.55)';
      ctx.lineWidth = Math.max(1, (kv >= 345 ? 2.4 : 1.6) / this.cam.scale);
      ctx.stroke();
      if (tier >= 2 && pts.length) {
        const mid = pts[Math.floor(pts.length / 2)];
        ctx.font = `600 ${Math.max(7, 9 / this.cam.scale)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 210, 120, 0.95)';
        ctx.textAlign = 'center';
        ctx.fillText(`${kv} kV`, mid.x, mid.y - 4 / this.cam.scale);
      }
    }
  };

  TurnerRangelandMap.prototype._paintTrails = function (ctx, vb, focus) {
    const scale = this.cam.scale;
    const glowW = Math.max(2.8, 5 / scale);
    const coreW = Math.max(1.4, 2.2 / scale);
    const trailStride = scale < 1.2 ? 4 : scale < 3 ? 2 : 1;
    let drawn = 0;
    const maxTrails = scale < 1 ? 12000 : 50000;

    for (let i = 0; i < this.bison.length; i++) {
      if (i % trailStride !== 0) continue;
      const b = this.bison[i];
      if (focus && b.pastureId !== focus) continue;
      if (b.x < vb.minX - 20 || b.x > vb.maxX + 20 || b.y < vb.minY - 20 || b.y > vb.maxY + 20) continue;
      const tr = b.trails;
      if (tr.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(tr[0].x, tr[0].y);
      for (let t = 1; t < tr.length; t++) ctx.lineTo(tr[t].x, tr[t].y);

      ctx.strokeStyle = TRAIL_GLOW;
      ctx.lineWidth = glowW;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      ctx.strokeStyle = TRAIL_CORE;
      ctx.lineWidth = coreW;
      ctx.stroke();

      drawn++;
      if (drawn >= maxTrails) break;
    }
  };

  TurnerRangelandMap.prototype._paintBison = function (ctx, vb, focus) {
    const r = Math.max(0.45, 1.15 / this.cam.scale);
    const stride = this.cam.scale < 0.9 ? 2 : 1;
    for (let i = 0; i < this.bison.length; i++) {
      if (i % stride !== 0) continue;
      const b = this.bison[i];
      if (focus && b.pastureId !== focus) continue;
      if (b.x < vb.minX - 5 || b.x > vb.maxX + 5 || b.y < vb.minY - 5 || b.y > vb.maxY + 5) continue;
      ctx.fillStyle = COLORS[b.sex];
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  TurnerRangelandMap.prototype._paintLabels = function (ctx, tier, focus) {
    if (tier < 3) return;
    const vb = this.visibleWorld();
    let n = 0;
    const cap = this.cam.scale >= 10 ? 80 : 30;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (const b of this.bison) {
      if (n >= cap) break;
      if (focus && b.pastureId !== focus) continue;
      if (b.x < vb.minX || b.x > vb.maxX || b.y < vb.minY || b.y > vb.maxY) continue;
      const sex = ['M', 'F', 'C'][b.sex];
      ctx.font = `600 ${Math.max(6, 8 / this.cam.scale)}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = COLORS[b.sex];
      ctx.fillText(`${sex} ${b.id}`, b.x, b.y - 2 / this.cam.scale);
      n++;
    }
  };

  TurnerRangelandMap.prototype._onClick = function (e) {
    const sp = this._eventPoint(e);
    const p = this.screenToWorld(sp.x, sp.y);
    let best = null;
    let bestD = 14 / this.cam.scale;
    for (const b of this.bison) {
      const d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d < bestD) {
        bestD = d;
        best = b;
      }
    }
    if (best) {
      this.fitPasture(best.pastureId);
      this._showBison(best);
      return;
    }
    for (const pasture of this.geo.pastures) {
      if (pointInPoly(p.x, p.y, pasture.polygon)) {
        this.fitPasture(pasture.id);
        this._showPasture(pasture);
        return;
      }
    }
  };

  TurnerRangelandMap.prototype.updateStream = function (stream) {
    this.stream = stream;
    if (!stream) return;

    if (stream.radar && stream.radar.placementSeed !== this._radar?.placementSeed) {
      this._radar = stream.radar;
      this._buildHerd(stream.radar);
    }

    this._powerSegments =
      stream.powerGrid?.mapSegments || stream.radar?.powerGridChannel?.mapSegments || [];

    const rng = mulberry32(Math.floor(Date.now() / 45000));
    const drift = ((stream.ingest?.pllProxy ?? 0.5) - 0.5) * 0.4;
    for (const b of this.bison) {
      const pasture = this.geo.pastures.find((p) => p.id === b.pastureId);
      if (!pasture) continue;
      const last = b.trails[b.trails.length - 1];
      let nx = last.x + (rng() - 0.5) * 5 + drift;
      let ny = last.y + (rng() - 0.5) * 5;
      if (pointInPoly(nx, ny, pasture.polygon)) {
        b.trails.push({ x: nx, y: ny });
        if (b.trails.length > TRAIL_LEN) b.trails.shift();
        b.x = nx;
        b.y = ny;
      }
    }

    const set = (id, v) => {
      const el = this.root.querySelector(id);
      if (el) el.textContent = v;
    };
    const b = stream.baseline || {};
    const live = stream.live || {};
    set('#tb-m-fidelity', stream.radar?.fidelityPct != null ? stream.radar.fidelityPct + '%' : '—');
    set('#tb-m-heads', (b.headCount || 45000).toLocaleString());
    set('#tb-m-flux', live.fluxSfu != null ? live.fluxSfu + ' sfu' : '—');
    set('#tb-m-kp', live.kp != null ? String(live.kp) : '—');
    const mag = stream.magnetic || stream.radar?.magneticChannel;
    set('#tb-m-mag', mag?.couplingIndex != null ? String(mag.couplingIndex) : '—');
    const pg = stream.powerGrid || stream.radar?.powerGridChannel;
    set('#tb-m-grid', pg?.lineCount != null ? String(pg.lineCount) : '—');

    const st = this.root.querySelector('#tb-chart-status');
    if (st && stream.radar) {
      st.textContent = `Passive radar locked · ${stream.radar.fidelityPct}% fidelity · fence × satellite × magnetic · pheromone trails active`;
    }
    this.render();
  };

  TurnerRangelandMap.prototype._showPanel = function (title, sub, html) {
    const panel = this.root.querySelector('#tb-chart-panel');
    panel.hidden = false;
    this.root.querySelector('#tb-panel-title').textContent = title;
    this.root.querySelector('#tb-panel-sub').textContent = sub || '';
    this.root.querySelector('#tb-panel-body').innerHTML = html;
  };

  TurnerRangelandMap.prototype._hidePanel = function () {
    this.root.querySelector('#tb-chart-panel').hidden = true;
  };

  TurnerRangelandMap.prototype._showBison = function (b) {
    const sex = ['Male', 'Female', 'Calf'][b.sex];
    this._showPanel(
      `${sex} · ${b.pastureName}`,
      'Radar fix · no GPS collar',
      `<ul class="tb-detail-list">
        <li><strong>ID</strong> ${b.id}</li>
        <li><strong>Pheromone trail</strong> ${b.trails.length} samples (light green path)</li>
        <li><strong>Position</strong> (${b.x.toFixed(1)}, ${b.y.toFixed(1)})</li>
      </ul>`,
    );
  };

  TurnerRangelandMap.prototype._showPasture = function (p) {
    const count = this.bison.filter((b) => b.pastureId === p.id).length;
    this._showPanel(
      p.name,
      p.state,
      `<ul class="tb-detail-list">
        <li><strong>Head on chart</strong> ${count.toLocaleString()}</li>
        <li><strong>Acres</strong> ${(p.acres || 0).toLocaleString()}</li>
      </ul>`,
    );
  };

  TurnerRangelandMap.prototype._showMetric = function (key) {
    const s = this.stream;
    if (!s) return;
    const map = {
      fidelity: ['Radar fidelity', (s.radar?.fidelityPct ?? '—') + '%', 'Fence × satellite × magnetic fuse'],
      heads: ['Bison', (s.baseline?.headCount || 45000).toLocaleString(), 'One dot per head on chart'],
      flux: ['Solar flux', s.live?.fluxSfu + ' sfu', 'NOAA SWPC'],
      kp: ['Kp', String(s.live?.kp ?? '—'), 'NOAA · EGS φ'],
      mag: ['Magnetic coupling', String(s.magnetic?.couplingIndex ?? s.radar?.magneticChannel?.couplingIndex ?? '—'), 'NOAA Boulder K · Dst · L1 Bz'],
      grid: ['Transmission lines', String(s.powerGrid?.lineCount ?? '—'), 'HIFLD ≥69 kV'],
    };
    const row = map[key] || ['Metric', '—', ''];
    this._showPanel(row[0], row[2], `<p class="tb-metric-big">${row[1]}</p>`);
  };

  global.TurnerRangelandMap = TurnerRangelandMap;
})(typeof window !== 'undefined' ? window : globalThis);
