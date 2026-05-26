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
  const HOLD_MS = 220;
  const PAN_THRESHOLD_PX = 6;
  const MARQUEE_MIN_PX = 14;
  const ESRI_WORLD_IMAGERY =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const ESRI_ATTRIBUTION =
    'Tiles © Esri — USDA FSA, USGS, Maxar & GIS community';

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

  function escapeCsv(s) {
    const txt = String(s ?? '');
    if (/[",\n]/.test(txt)) return `"${txt.replace(/"/g, '""')}"`;
    return txt;
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

  function buildTrails(pos, poly, rng, syntheticAllowed) {
    if (!syntheticAllowed) {
      return [{ x: pos.x, y: pos.y }];
    }
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

  function TurnerRangelandMap(rootEl) {
    this.root = rootEl;
    this.geo = null;
    this.stream = null;
    this.bison = [];
    this._radar = null;
    this._powerSegments = [];
    this.map = null;
    this.pastureLayer = null;
    this._pasturePolys = {};
    this.focusPasture = null;
    this._pointer = null;
    this._suppressClick = false;
    this._pendingStream = null;
    this._basemapMode = 'imagery';
    this._meanWeightLbs = 1100;
    this._historicalMode = false;
    this.canvas = null;
    this.ctx = null;
    this.dpr = 1;
  }

  TurnerRangelandMap.prototype._bbox = function () {
    return (
      this.geo?.networkGeoBbox || { west: -114, east: -100, south: 32, north: 48 }
    );
  };

  TurnerRangelandMap.prototype._xyToLatLng = function (x, y) {
    const b = this._bbox();
    const lat = b.north - (y / MAP_H) * (b.north - b.south);
    const lng = b.west + (x / MAP_W) * (b.east - b.west);
    return { lat, lng };
  };

  TurnerRangelandMap.prototype._latLngToXY = function (lat, lng) {
    const b = this._bbox();
    return {
      x: ((lng - b.west) / (b.east - b.west)) * MAP_W,
      y: (1 - (lat - b.south) / (b.north - b.south)) * MAP_H,
    };
  };

  TurnerRangelandMap.prototype._pastureGeoScale = function (pasture) {
    const poly = pasture.polygon;
    const pb = polygonBounds(poly);
    const pw = Math.max(pb.maxX - pb.minX, 48);
    const ph = Math.max(pb.maxY - pb.minY, 48);
    const scx = poly.reduce((s, c) => s + c[0], 0) / poly.length;
    const scy = poly.reduce((s, c) => s + c[1], 0) / poly.length;
    const acreScale = Math.sqrt((pasture.acres || 120000) / 220000);
    const net = this._bbox();
    const dLon = 1.15 * acreScale * (pw / MAP_W) * (net.east - net.west);
    const dLat = 0.95 * acreScale * (ph / MAP_H) * (net.north - net.south);
    return { scx, scy, pw, ph, dLon, dLat };
  };

  TurnerRangelandMap.prototype._schematicXYToLatLng = function (x, y, pasture) {
    if (pasture.lat != null && pasture.lon != null) {
      const g = this._pastureGeoScale(pasture);
      return {
        lat: pasture.lat + ((g.scy - y) / g.ph) * g.dLat,
        lng: pasture.lon + ((x - g.scx) / g.pw) * g.dLon,
      };
    }
    return this._xyToLatLng(x, y);
  };

  TurnerRangelandMap.prototype._prepareGeo = function () {
    for (const p of this.geo.pastures) {
      p.latlngs = p.polygon.map(([x, y]) => {
        const ll = this._schematicXYToLatLng(x, y, p);
        return [ll.lat, ll.lng];
      });
    }
  };

  TurnerRangelandMap.prototype._syncBisonLatLng = function (b) {
    const pasture = this.geo.pastures.find((p) => p.id === b.pastureId);
    const ll = pasture
      ? this._schematicXYToLatLng(b.x, b.y, pasture)
      : this._xyToLatLng(b.x, b.y);
    b.lat = ll.lat;
    b.lng = ll.lng;
    for (const t of b.trails) {
      const tll = pasture
        ? this._schematicXYToLatLng(t.x, t.y, pasture)
        : this._xyToLatLng(t.x, t.y);
      t.lat = tll.lat;
      t.lng = tll.lng;
    }
  };

  TurnerRangelandMap.prototype._waitForLeaflet = function (maxMs) {
    return new Promise((resolve) => {
      if (global.L) {
        resolve(true);
        return;
      }
      const t0 = Date.now();
      const tick = () => {
        if (global.L) {
          resolve(true);
          return;
        }
        if (Date.now() - t0 >= maxMs) {
          resolve(false);
          return;
        }
        setTimeout(tick, 40);
      };
      tick();
    });
  };

  TurnerRangelandMap.prototype._initLeaflet = async function () {
    const ok = await this._waitForLeaflet(10000);
    const L = global.L;
    if (!ok || !L) {
      console.warn('Leaflet missing — herd overlay uses schematic projection (no Esri tiles)');
      this._basemapMode = 'schematic';
      const el = this.root.querySelector('#tb-leaflet-map');
      if (el) {
        el.innerHTML =
          '<p class="tb-basemap-fallback">Satellite tiles unavailable — passive radar overlay active</p>';
      }
      return;
    }
    this._basemapMode = 'imagery';
    const mapEl = this.root.querySelector('#tb-leaflet-map');
    if (!mapEl) return;

    this.map = L.map(mapEl, {
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 16,
      scrollWheelZoom: true,
      wheelDebounceTime: 30,
      wheelPxPerZoomLevel: 90,
      worldCopyJump: false,
    });

    L.tileLayer(ESRI_WORLD_IMAGERY, {
      attribution: ESRI_ATTRIBUTION,
      maxNativeZoom: 19,
      maxZoom: 19,
    }).addTo(this.map);

    this.pastureLayer = L.layerGroup().addTo(this.map);
    this._pasturePolys = {};
    for (const p of this.geo.pastures) {
      const poly = L.polygon(p.latlngs, {
        color: '#c4a874',
        weight: 1.4,
        fillColor: '#1a3d2e',
        fillOpacity: 0.22,
      });
      poly.pastureId = p.id;
      poly.addTo(this.pastureLayer);
      this._pasturePolys[p.id] = poly;
    }

    this.fitNetwork();
    this._applySoftMapBounds();

    this.map.on('move zoom zoomend resize', () => this.render());
    this.map.on('click', (e) => this._onMapClick(e));
    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
      this.render();
    }, 80);
  };

  TurnerRangelandMap.prototype._mapZoom = function () {
    return this.map ? this.map.getZoom() : 5;
  };

  TurnerRangelandMap.prototype._latLngToScreen = function (lat, lng) {
    if (this.map && global.L) {
      return this.map.latLngToContainerPoint(global.L.latLng(lat, lng));
    }
    const b = this._bbox();
    return {
      x: ((lng - b.west) / (b.east - b.west)) * this.viewW,
      y: ((b.north - lat) / (b.north - b.south)) * this.viewH,
    };
  };

  TurnerRangelandMap.prototype._latLngToContainer = function (lat, lng) {
    return this._latLngToScreen(lat, lng);
  };

  TurnerRangelandMap.prototype._containerToLatLng = function (x, y) {
    if (!this.map || !global.L) return null;
    return this.map.containerPointToLatLng(global.L.point(x, y));
  };

  TurnerRangelandMap.prototype._networkLatLngBounds = function () {
    const L = global.L;
    const b = this._bbox();
    if (!L || !this.geo?.pastures?.length) {
      return [
        [b.south, b.west],
        [b.north, b.east],
      ];
    }
    const pts = [];
    for (const p of this.geo.pastures) {
      for (const ll of p.latlngs || []) pts.push(ll);
    }
    if (!pts.length) {
      return [
        [b.south, b.west],
        [b.north, b.east],
      ];
    }
    return L.latLngBounds(pts).pad(0.08);
  };

  TurnerRangelandMap.prototype._applySoftMapBounds = function () {
    if (!this.map || !global.L) return;
    const bounds = this._networkLatLngBounds();
    const pad = bounds.pad(0.22);
    this.map.setMaxBounds(pad);
    this.map.options.maxBoundsViscosity = 0.05;
  };

  TurnerRangelandMap.prototype._updatePastureStyles = function () {
    const focus = this.focusPasture;
    for (const p of this.geo.pastures) {
      const poly = this._pasturePolys[p.id];
      if (!poly) continue;
      const on = !focus || p.id === focus;
      poly.setStyle({
        fillOpacity: on ? (p.id === focus ? 0.32 : 0.22) : 0.06,
        opacity: on ? 0.95 : 0.2,
        weight: p.id === focus ? 2.2 : 1.2,
      });
    }
  };

  TurnerRangelandMap.prototype.load = async function () {
    this.root.innerHTML = '<p class="tb-hint">Loading rangeland chart…</p>';
    const res = await fetch('/data/turner-rangeland-geography.json');
    if (!res.ok) throw new Error('Geography unavailable');
    this.geo = await res.json();
    this._prepareGeo();
    this._buildHerd(null);
    this._renderChrome();
    await this._initLeaflet();
    this._bind();
    this.fitNetwork();
    this.render();
    if (this._pendingStream) {
      this.updateStream(this._pendingStream);
      this._pendingStream = null;
    }
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
    const placementSeed = radar?.placementSeed ?? 0;
    const meanWeightLbs = this._meanWeightLbs ?? g.meanWeightLbs ?? 1100;
    const synth = this.stream?.syntheticDataAllowed === true;
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
      const bounds = polygonBounds(poly);
      const gridSize = rp?.gridSize || 24;
      for (let n = 0; n < block.count && idx < order.length; n++, idx++) {
        const pos = rp?.weights
          ? pickWeightedPosition(rp.weights, gridSize, poly, rng)
          : randomInPoly(poly, rng);
        let radarField = null;
        if (rp?.weights) {
          radarField = sampleBilinearField(pos.x, pos.y, bounds, gridSize, rp.weights);
        }
        const sex = order[idx];
        const id = 'b-' + idx;
        const weightLbs = estimateBisonWeightLbs(
          { id, sex },
          { meanWeightLbs, placementSeed, radarField, syntheticDataAllowed: synth },
        );
        this.bison.push({
          id,
          x: pos.x,
          y: pos.y,
          sex,
          pastureId: block.pasture.id,
          pastureName: block.pasture.name,
          trails: buildTrails(pos, poly, rng, synth),
          weightLbs,
        });
        this._syncBisonLatLng(this.bison[this.bison.length - 1]);
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
        <div class="tb-chart-stage">
          <div id="tb-leaflet-map" class="tb-leaflet-map" aria-hidden="true"></div>
          <canvas class="tb-chart-canvas" id="tb-chart-canvas" aria-label="Rangeland herd overlay"></canvas>
          <div class="tb-chart-overlay tb-chart-overlay--top" aria-label="Chart labels">
            <header class="tb-chart-head">
              <div>
                <h2 class="tb-chart-title">Passive radar rangeland chart</h2>
                <p class="tb-chart-sub" id="tb-chart-sub">${escapeHtml(g.networkLabel || '')} · Esri US satellite imagery · scroll zoom · drag pan · hold &amp; slide to zoom area</p>
              </div>
              <div class="tb-chart-actions">
                <button type="button" class="tb-chart-btn" id="tb-zoom-out" title="Zoom out">−</button>
                <button type="button" class="tb-chart-btn" id="tb-zoom-in" title="Zoom in">+</button>
                <button type="button" class="tb-chart-btn" id="tb-fit" title="Full network">Fit</button>
                <button type="button" class="tb-chart-btn tb-chart-btn--report" id="tb-herd-report" title="Herd roster report by ranch">Report</button>
                <button type="button" class="tb-chart-btn tb-chart-btn--download" id="tb-download-herd" title="Download complete herd list (CSV)">Download</button>
              </div>
            </header>
            <div class="tb-metric-strip" role="group" aria-label="Live metrics">${metricHtml}</div>
            <div class="tb-chart-legend">
              <span><i class="swatch swatch-male"></i>Male</span>
              <span><i class="swatch swatch-female"></i>Female</span>
              <span><i class="swatch swatch-calf"></i>Calf</span>
              <span><i class="swatch swatch-trail"></i>Pheromone trail</span>
              <span><i class="swatch swatch-power"></i>Transmission</span>
              <span class="tb-imagery-credit">Basemap · Esri World Imagery (USDA / USGS)</span>
            </div>
          </div>
          <p class="tb-chart-status tb-chart-overlay tb-chart-overlay--bottom" id="tb-chart-status" aria-live="polite">Awaiting telemetry…</p>
          <aside class="tb-chart-panel" id="tb-chart-panel" hidden>
            <button type="button" class="tb-chart-panel-x" id="tb-chart-panel-x" aria-label="Close">×</button>
            <h3 id="tb-panel-title"></h3>
            <p id="tb-panel-sub"></p>
            <div id="tb-panel-body"></div>
          </aside>
        </div>
      </section>
    `;

    this.stage = this.root.querySelector('.tb-chart-stage');
    this.canvas = this.root.querySelector('#tb-chart-canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this._resizeCanvas();
    window.addEventListener('resize', () => {
      this._resizeCanvas();
      if (this.map) this.map.invalidateSize();
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
    const L = global.L;
    this.root.querySelector('#tb-zoom-in').addEventListener('click', () => {
      if (self.map) self.map.zoomIn();
    });
    this.root.querySelector('#tb-zoom-out').addEventListener('click', () => {
      if (self.map) self.map.zoomOut();
    });
    this.root.querySelector('#tb-fit').addEventListener('click', () => self.fitNetwork());
    this.root.querySelector('#tb-herd-report').addEventListener('click', () => self._showHerdReport());
    const dlToolbar = this.root.querySelector('#tb-download-herd');
    if (dlToolbar) dlToolbar.addEventListener('click', () => self.downloadHerdReport());
    this.root.querySelector('#tb-chart-panel-x').addEventListener('click', () => self._hidePanel());

    this.root.querySelectorAll('[data-metric]').forEach((btn) => {
      btn.addEventListener('click', () => self._showMetric(btn.getAttribute('data-metric')));
    });

    if (!this.map) return;

    const container = this.map.getContainer();
    const onPointerEnd = (e) => self._finishPointer(e);

    container.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      self._clearPointerHold();
      self._suppressClick = false;
      const p = self._eventPoint(e);
      self._pointer = {
        id: e.pointerId,
        sx: p.x,
        sy: p.y,
        cx: p.x,
        cy: p.y,
        mode: 'pending',
      };
      self._pointer.holdTimer = setTimeout(() => {
        if (!self._pointer || self._pointer.mode !== 'pending') return;
        self._pointer.mode = 'select';
        self.map.dragging.disable();
        try {
          container.setPointerCapture(self._pointer.id);
        } catch (_) {
          /* ignore */
        }
        self.stage.classList.add('tb-chart-stage--marquee');
        self.render();
      }, HOLD_MS);
    });
    container.addEventListener('pointermove', (e) => {
      if (!self._pointer || self._pointer.id !== e.pointerId) return;
      const p = self._eventPoint(e);
      self._pointer.cx = p.x;
      self._pointer.cy = p.y;
      if (self._pointer.mode === 'pending') {
        const dist = Math.hypot(p.x - self._pointer.sx, p.y - self._pointer.sy);
        if (dist >= PAN_THRESHOLD_PX) {
          self._clearPointerHold();
          self._pointer = null;
        }
        return;
      }
      if (self._pointer.mode === 'select') self.render();
    });
    container.addEventListener('pointerup', onPointerEnd);
    container.addEventListener('pointercancel', onPointerEnd);
    container.addEventListener('contextmenu', (e) => e.preventDefault());
  };

  TurnerRangelandMap.prototype._clearPointerHold = function () {
    if (this._pointer?.holdTimer) {
      clearTimeout(this._pointer.holdTimer);
      this._pointer.holdTimer = null;
    }
  };

  TurnerRangelandMap.prototype._finishPointer = function (e) {
    const ptr = this._pointer;
    if (!ptr || (e && ptr.id !== e.pointerId)) return;
    this._clearPointerHold();
    if (e) {
      const p = this._eventPoint(e);
      ptr.cx = p.x;
      ptr.cy = p.y;
    }

    if (ptr.mode === 'select') {
      this.stage.classList.remove('tb-chart-stage--marquee');
      if (this.map) this.map.dragging.enable();
      const x1 = Math.min(ptr.sx, ptr.cx);
      const x2 = Math.max(ptr.sx, ptr.cx);
      const y1 = Math.min(ptr.sy, ptr.cy);
      const y2 = Math.max(ptr.sy, ptr.cy);
      if (x2 - x1 >= MARQUEE_MIN_PX && y2 - y1 >= MARQUEE_MIN_PX && global.L) {
        const sw = this._containerToLatLng(x1, y2);
        const ne = this._containerToLatLng(x2, y1);
        if (sw && ne) {
          this.map.fitBounds(global.L.latLngBounds(sw, ne), { padding: [28, 28] });
          this.focusPasture = null;
          this._hidePanel();
          this._updatePastureStyles();
        }
      }
      this._suppressClick = true;
    }

    this._pointer = null;
    if (e && this.map) {
      try {
        this.map.getContainer().releasePointerCapture(e.pointerId);
      } catch (_) {
        /* ignore */
      }
    }
    this.render();
  };

  TurnerRangelandMap.prototype._eventPoint = function (e) {
    const mapRect = this.map
      ? this.map.getContainer().getBoundingClientRect()
      : this.stage.getBoundingClientRect();
    return { x: e.clientX - mapRect.left, y: e.clientY - mapRect.top };
  };

  TurnerRangelandMap.prototype.fitNetwork = function () {
    if (this.map && global.L) {
      const bounds = this._networkLatLngBounds();
      this.map.fitBounds(bounds, {
        paddingTopLeft: [48, 88],
        paddingBottomRight: [48, 48],
        maxZoom: 6,
      });
    }
    this.focusPasture = null;
    this._updatePastureStyles();
    this.render();
  };

  TurnerRangelandMap.prototype.fitPasture = function (id) {
    const poly = this._pasturePolys[id];
    if (poly && this.map) {
      this.map.fitBounds(poly.getBounds(), { padding: [36, 36], maxZoom: 12 });
    }
    this.focusPasture = id;
    this._updatePastureStyles();
    this.render();
  };

  TurnerRangelandMap.prototype._boundsXY = function () {
    if (!this.map) return { minX: 0, maxX: MAP_W, minY: 0, maxY: MAP_H };
    const b = this.map.getBounds();
    const sw = this._latLngToXY(b.getSouth(), b.getWest());
    const ne = this._latLngToXY(b.getNorth(), b.getEast());
    return {
      minX: Math.min(sw.x, ne.x),
      maxX: Math.max(sw.x, ne.x),
      minY: Math.min(sw.y, ne.y),
      maxY: Math.max(sw.y, ne.y),
    };
  };

  TurnerRangelandMap.prototype.render = function () {
    if (!this.ctx || !this.geo) {
      this._updateRenderNote();
      return;
    }
    const ctx = this.ctx;
    const dpr = this.dpr;
    const zoom = this._mapZoom();
    const tier = labelTier(zoom);
    const vb = this._boundsXY();
    const focus = this.focusPasture;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.viewW, this.viewH);
    if (!this.map) {
      ctx.fillStyle = 'rgba(10, 24, 18, 0.55)';
      ctx.fillRect(0, 0, this.viewW, this.viewH);
      this._paintSchematicPastures(ctx, focus);
    }

    this._updatePastureStyles();
    this._paintPower(ctx, tier, focus);
    this._paintTrails(ctx, vb, focus, zoom);
    this._paintBison(ctx, vb, focus, zoom);
    this._paintPastureLabels(ctx, tier, focus);
    this._paintPowerLabels(ctx, tier, focus);
    this._paintBisonLabels(ctx, tier, focus);
    this._paintMapHud(ctx, tier);
    this._paintMarquee(ctx);

    this._updateRenderNote();

    const sub = this.root.querySelector('#tb-chart-sub');
    if (sub) {
      const name = focus
        ? this.geo.pastures.find((p) => p.id === focus)?.name || ''
        : '';
      const basemap = this.map ? 'Esri US imagery' : 'schematic fallback';
      sub.textContent = `${this.geo.networkLabel} · ${basemap} · zoom ${zoom}${name ? ' · ' + name : ''} · drag pan · hold & slide to zoom area`;
    }
  };

  TurnerRangelandMap.prototype._paintSchematicPastures = function (ctx, focus) {
    for (const p of this.geo.pastures) {
      if (focus && p.id !== focus) ctx.globalAlpha = 0.15;
      else ctx.globalAlpha = 1;
      const ring = p.latlngs
        .map((ll) => this._latLngToScreen(ll[0], ll[1]))
        .filter(Boolean);
      if (ring.length < 3) continue;
      ctx.beginPath();
      ctx.moveTo(ring[0].x, ring[0].y);
      for (let i = 1; i < ring.length; i++) ctx.lineTo(ring[i].x, ring[i].y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(45, 95, 72, 0.35)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(196, 168, 116, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  TurnerRangelandMap.prototype._ptContainer = function (lat, lng) {
    const pt = this._latLngToScreen(lat, lng);
    if (!pt || !Number.isFinite(pt.x)) return null;
    return pt;
  };

  TurnerRangelandMap.prototype._paintPastureLabels = function (ctx, tier, focus) {
    if (tier < 0) return;
    const zoom = this._mapZoom();
    for (const p of this.geo.pastures) {
      if (focus && p.id !== focus) continue;
      let lat = 0;
      let lng = 0;
      for (const ll of p.latlngs) {
        lat += ll[0];
        lng += ll[1];
      }
      lat /= p.latlngs.length;
      lng /= p.latlngs.length;
      const pt = this._ptContainer(lat, lng);
      if (!pt) continue;
      const heads = this.bison.filter((b) => b.pastureId === p.id).length;
      const fs = Math.max(10, 14 - zoom * 0.35);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${fs}px Libre Baskerville, Georgia, serif`;
      ctx.strokeStyle = 'rgba(8, 20, 15, 0.92)';
      ctx.lineWidth = Math.max(2, 5 - zoom * 0.25);
      ctx.fillStyle = '#f8f6f0';
      ctx.strokeText(p.name, pt.x, pt.y - 10);
      ctx.fillText(p.name, pt.x, pt.y - 10);
      if (tier >= 1) {
        const sub = `${p.state} · ${heads.toLocaleString()} head`;
        ctx.font = `500 ${Math.max(8, 11 - zoom * 0.3)}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = '#d4edc8';
        ctx.strokeText(sub, pt.x, pt.y + 8);
        ctx.fillText(sub, pt.x, pt.y + 8);
      }
      if (tier >= 2) {
        const acres = `${(p.acres || 0).toLocaleString()} acres`;
        ctx.strokeText(acres, pt.x, pt.y + 22);
        ctx.fillText(acres, pt.x, pt.y + 22);
      }
    }
  };

  TurnerRangelandMap.prototype._paintPower = function (ctx, tier, focus) {
    for (const seg of this._powerSegments) {
      if (focus && seg.pastureId && seg.pastureId !== focus) continue;
      const pts = seg.points || [];
      if (pts.length < 2) continue;
      const c0 = this._ptContainer(
        this._xyToLatLng(pts[0].x, pts[0].y).lat,
        this._xyToLatLng(pts[0].x, pts[0].y).lng,
      );
      if (!c0) continue;
      ctx.beginPath();
      ctx.moveTo(c0.x, c0.y);
      for (let i = 1; i < pts.length; i++) {
        const ll = this._xyToLatLng(pts[i].x, pts[i].y);
        const ci = this._ptContainer(ll.lat, ll.lng);
        if (ci) ctx.lineTo(ci.x, ci.y);
      }
      const kv = seg.voltageKv || 115;
      ctx.strokeStyle = kv >= 345 ? 'rgba(255, 120, 90, 0.85)' : 'rgba(255, 180, 70, 0.65)';
      ctx.lineWidth = kv >= 345 ? 2.4 : 1.6;
      ctx.stroke();
    }
  };

  TurnerRangelandMap.prototype._paintPowerLabels = function (ctx, tier, focus) {
    if (tier < 2) return;
    for (const seg of this._powerSegments) {
      if (focus && seg.pastureId && seg.pastureId !== focus) continue;
      const pts = seg.points || [];
      if (pts.length < 2) continue;
      const mid = pts[Math.floor(pts.length / 2)];
      const ll = this._xyToLatLng(mid.x, mid.y);
      const pt = this._ptContainer(ll.lat, ll.lng);
      if (!pt) continue;
      const kv = seg.voltageKv || 115;
      ctx.font = '600 9px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 210, 120, 0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${kv} kV`, pt.x, pt.y - 4);
    }
  };

  TurnerRangelandMap.prototype._paintTrails = function (ctx, vb, focus, zoom) {
    const stride = visualStride(zoom);
    const glowW = Math.max(1.2, 5 - zoom * 0.35);
    const coreW = Math.max(0.65, 2.2 - zoom * 0.2);
    const trailStride = stride.trails;
    let drawn = 0;
    const maxTrails = zoom <= 5 ? 3500 : zoom <= 7 ? 8000 : 45000;

    for (let i = 0; i < this.bison.length; i++) {
      if (i % trailStride !== 0) continue;
      const b = this.bison[i];
      if (focus && b.pastureId !== focus) continue;
      if (b.x < vb.minX - 20 || b.x > vb.maxX + 20 || b.y < vb.minY - 20 || b.y > vb.maxY + 20)
        continue;
      const tr = b.trails;
      if (tr.length < 2) continue;

      const p0 = this._ptContainer(tr[0].lat, tr[0].lng);
      if (!p0) continue;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      for (let t = 1; t < tr.length; t++) {
        const pt = this._ptContainer(tr[t].lat, tr[t].lng);
        if (pt) ctx.lineTo(pt.x, pt.y);
      }

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

  TurnerRangelandMap.prototype._paintBison = function (ctx, vb, focus, zoom) {
    const r = Math.max(1.5, 5.5 - zoom * 0.35);
    const stride = visualStride(zoom).dots;
    for (let i = 0; i < this.bison.length; i++) {
      if (i % stride !== 0) continue;
      const b = this.bison[i];
      if (focus && b.pastureId !== focus) continue;
      if (b.x < vb.minX - 5 || b.x > vb.maxX + 5 || b.y < vb.minY - 5 || b.y > vb.maxY + 5) continue;
      const pt = this._ptContainer(b.lat, b.lng);
      if (!pt) continue;
      ctx.fillStyle = COLORS[b.sex];
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  TurnerRangelandMap.prototype._paintMarquee = function (ctx) {
    const ptr = this._pointer;
    if (!ptr || ptr.mode !== 'select') return;
    const x1 = Math.min(ptr.sx, ptr.cx);
    const x2 = Math.max(ptr.sx, ptr.cx);
    const y1 = Math.min(ptr.sy, ptr.cy);
    const y2 = Math.max(ptr.sy, ptr.cy);
    ctx.save();
    ctx.fillStyle = 'rgba(196, 168, 116, 0.12)';
    ctx.strokeStyle = 'rgba(196, 168, 116, 0.95)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.setLineDash([]);
    ctx.font = '600 10px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(232, 228, 220, 0.95)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Release to zoom', x1 + 4, Math.max(y1 - 4, 12));
    ctx.restore();
  };

  TurnerRangelandMap.prototype._paintMapHud = function (ctx, tier) {
    const topPad = 72;
    const y = topPad + (tier === 0 ? 14 : 4);
    ctx.save();
    ctx.font = '600 10px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.strokeStyle = 'rgba(8, 20, 15, 0.75)';
    ctx.lineWidth = 3;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    if (tier === 0) {
      const line = 'Esri US satellite · radar-weighted herd overlay';
      ctx.strokeText(line, 10, topPad);
      ctx.fillText(line, 10, topPad);
    }
    ctx.strokeText('West', 10, y);
    ctx.fillText('West', 10, y);
    ctx.textAlign = 'right';
    ctx.strokeText('East', this.viewW - 10, y);
    ctx.fillText('East', this.viewW - 10, y);
    ctx.restore();
  };

  TurnerRangelandMap.prototype._statusLine = function () {
    const stride = visualStride(this._mapZoom());
    const placed = this.bison.length;
    if (this._historicalMode) {
      return this._statusHead || 'Historical range · model sample';
    }
    let head = this._statusHead || 'Awaiting telemetry…';
    if (this.stream?.radar) {
      head = `Synthesis snapshot · ${this.stream.radar.fidelityPct}% modeled fuse · fence × satellite × magnetic · trails`;
    } else if (placed && this._radar?.placementSeed) {
      head = `${placed.toLocaleString()} bison · radar-weighted placement (continuous field, not grid snap)`;
    }
    const sample =
      stride.dots > 1 || stride.trails > 1
        ? ` · zoom: 1/${stride.dots} dots · 1/${stride.trails} trails drawn (${placed.toLocaleString()} heads placed)`
        : '';
    return head + sample;
  };

  TurnerRangelandMap.prototype._updateRenderNote = function () {
    const st = this.root.querySelector('#tb-chart-status');
    if (st) st.textContent = this._statusLine();
  };

  TurnerRangelandMap.prototype._paintBisonLabels = function (ctx, tier, focus) {
    if (tier < 3) return;
    const vb = this._boundsXY();
    let n = 0;
    const cap = this._mapZoom() >= 11 ? 80 : 30;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (const b of this.bison) {
      if (n >= cap) break;
      if (focus && b.pastureId !== focus) continue;
      if (b.x < vb.minX || b.x > vb.maxX || b.y < vb.minY || b.y > vb.maxY) continue;
      const pt = this._ptContainer(b.lat, b.lng);
      if (!pt) continue;
      const sex = ['M', 'F', 'C'][b.sex];
      ctx.font = '600 8px Inter, system-ui, sans-serif';
      ctx.fillStyle = COLORS[b.sex];
      ctx.fillText(`${sex} ${b.id}`, pt.x, pt.y - 3);
      n++;
    }
  };

  TurnerRangelandMap.prototype._onMapClick = function (e) {
    if (this._suppressClick) {
      this._suppressClick = false;
      return;
    }
    const ll = e.latlng;
    if (!ll) return;
    const sp = this.map.latLngToContainerPoint(ll);
    let best = null;
    let bestD = 14;
    for (const b of this.bison) {
      const pt = this._ptContainer(b.lat, b.lng);
      if (!pt) continue;
      const d = Math.hypot(pt.x - sp.x, pt.y - sp.y);
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
    const xy = this._latLngToXY(ll.lat, ll.lng);
    for (const pasture of this.geo.pastures) {
      if (pointInPoly(xy.x, xy.y, pasture.polygon)) {
        this.fitPasture(pasture.id);
        this._showPasture(pasture);
        return;
      }
    }
  };

  TurnerRangelandMap.prototype.applyHistoricalSample = function (animals) {
    if (!this.geo || !Array.isArray(animals) || !animals.length) return;
    this._historicalMode = true;
    this.bison = animals.map((a) => {
      const trailSrc = a.trailXY && a.trailXY.length ? a.trailXY : [{ x: a.x, y: a.y }];
      const trails = trailSrc.map((pt) => ({ x: pt.x, y: pt.y }));
      return {
        id: a.id,
        x: a.x,
        y: a.y,
        sex: a.sex,
        pastureId: a.pastureId,
        pastureName: a.pastureName,
        weightLbs: a.weightLbs,
        trails,
      };
    });
    for (const b of this.bison) this._syncBisonLatLng(b);
    this._statusHead =
      'Historical range · model sample (Open-Meteo soil × radar fuse) · not GPS collar positions';
    this._updateRenderNote();
    this.render();
  };

  TurnerRangelandMap.prototype.exitHistoricalMode = function () {
    this._historicalMode = false;
    this._radar = null;
    if (this.stream) {
      this.updateStream(this.stream);
    } else {
      this._buildHerd(null);
      this._updateRenderNote();
      this.render();
    }
  };

  TurnerRangelandMap.prototype.updateStream = function (stream) {
    this.stream = stream;
    if (!stream) {
      this._updateRenderNote();
      return;
    }
    if (this._historicalMode) {
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
      return;
    }
    if (!this.ctx || !this.geo) {
      this._pendingStream = stream;
      return;
    }

    this._meanWeightLbs = stream.baseline?.meanWeightLbs ?? this._meanWeightLbs ?? 1100;

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
        this._syncBisonLatLng(b);
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

    if (stream.radar) {
      this._statusHead = `Synthesis snapshot · ${stream.radar.fidelityPct}% modeled fuse · fence × satellite × magnetic · trails`;
    } else {
      this._statusHead = 'Telemetry live · awaiting radar fuse payload';
    }
    this._updateRenderNote();
    this.render();
  };

  TurnerRangelandMap.prototype._showPanel = function (title, sub, html) {
    const panel = this.root.querySelector('#tb-chart-panel');
    panel.hidden = false;
    this.root.querySelector('#tb-panel-title').textContent = title;
    this.root.querySelector('#tb-panel-sub').textContent = sub || '';
    this.root.querySelector('#tb-panel-body').innerHTML = html;
  };

  TurnerRangelandMap.prototype._sexLabel = function (sex) {
    const labels = ['Male', 'Female', 'Calf'];
    return labels[sex] ?? 'Unknown';
  };

  TurnerRangelandMap.prototype._bisonStatus = function (b) {
    const w = Number(b.weightLbs || 0);
    if (b.sex === SEX.calf) {
      if (w < 360) return { status: 'Calf monitor', remark: 'Calf low weight - monitor intake and shelter.' };
      if (w > 620) return { status: 'Calf review', remark: 'Calf above expected weight band - verify cohort age bucket.' };
      return { status: 'All looks good', remark: 'Calf in expected weight band.' };
    }
    if (w < 900) return { status: 'Friction point', remark: 'Adult low weight pocket - check forage and movement pressure.' };
    if (w > 1600) return { status: 'Incipient issue', remark: 'Adult high weight outlier - validate estimate and sampling drift.' };
    return { status: 'All looks good', remark: 'Mass estimate and movement pattern are in-range.' };
  };

  TurnerRangelandMap.prototype._buildHerdReport = function () {
    const byRanch = new Map();
    for (const b of this.bison) {
      const ranch = b.pastureName || b.pastureId || 'Unknown';
      if (!byRanch.has(ranch)) byRanch.set(ranch, []);
      byRanch.get(ranch).push(b);
    }
    const ranchNames = Array.from(byRanch.keys()).sort((a, b) => a.localeCompare(b));
    const rows = [];
    const ranchSummaries = [];
    let totalWeight = 0;
    let totalAlerts = 0;
    let totalCalves = 0;
    for (const ranch of ranchNames) {
      const herd = byRanch.get(ranch);
      herd.sort((a, b) => (a.id < b.id ? -1 : 1));
      let ranchWeight = 0;
      let alerts = 0;
      let calves = 0;
      for (const b of herd) {
        const s = this._bisonStatus(b);
        const sexLabel = this._sexLabel(b.sex);
        const calfTag = b.sex === SEX.calf ? 'Calf' : '';
        const weight = Number(b.weightLbs || 0);
        ranchWeight += weight;
        totalWeight += weight;
        if (b.sex === SEX.calf) {
          calves += 1;
          totalCalves += 1;
        }
        if (s.status !== 'All looks good') {
          alerts += 1;
          totalAlerts += 1;
        }
        rows.push({
          ranch,
          id: b.id,
          lat: Number(b.lat).toFixed(5),
          lng: Number(b.lng).toFixed(5),
          sex: sexLabel,
          calfTag,
          weightLbs: Math.round(weight),
          status: s.status,
          remark: s.remark,
        });
      }
      const meanWeight = herd.length ? Math.round(ranchWeight / herd.length) : 0;
      const alertPct = herd.length ? (alerts / herd.length) * 100 : 0;
      const ranchRemark =
        alerts === 0
          ? 'All looks good.'
          : alertPct >= 10
            ? 'Incipient issues detected: check forage drawdown, movement pressure, and estimate drift.'
            : 'Minor friction points present: continue watchlist monitoring.';
      ranchSummaries.push({
        ranch,
        headCount: herd.length,
        calves,
        alerts,
        meanWeight,
        remark: ranchRemark,
      });
    }
    const totalHead = rows.length;
    const meanWeightAll = totalHead ? Math.round(totalWeight / totalHead) : 0;
    const globalRemark =
      totalAlerts === 0
        ? 'All looks good across all ranches.'
        : `${totalAlerts.toLocaleString()} heads flagged for friction points or incipient issues.`;
    return { rows, ranchSummaries, totals: { totalHead, totalCalves, totalAlerts, meanWeightAll, globalRemark } };
  };

  /** Public — open ranch summary report (includes download). */
  TurnerRangelandMap.prototype.showHerdReport = function () {
    this._showHerdReport();
  };

  /** Public — managers download full herd roster (all heads, by ranch). */
  TurnerRangelandMap.prototype.downloadHerdReport = function () {
    if (!this.bison || !this.bison.length) {
      window.alert('Herd list is still loading. Wait for the map to finish, then try again.');
      return;
    }
    this._downloadHerdReportCsv();
  };

  TurnerRangelandMap.prototype._downloadHerdReportCsv = function () {
    const report = this._buildHerdReport();
    const lines = [
      'Ranch,ID,Latitude,Longitude,Sex,CalfTag,ApproxWeightLbs,Status,Remark',
      ...report.rows.map(
        (r) =>
          [
            escapeCsv(r.ranch),
            escapeCsv(r.id),
            r.lat,
            r.lng,
            escapeCsv(r.sex),
            escapeCsv(r.calfTag),
            String(r.weightLbs),
            escapeCsv(r.status),
            escapeCsv(r.remark),
          ].join(','),
      ),
      '',
      'Ranch,HeadCount,Calves,Flagged,MeanWeightLbs,Remarks',
      ...report.ranchSummaries.map(
        (r) =>
          [
            escapeCsv(r.ranch),
            String(r.headCount),
            String(r.calves),
            String(r.alerts),
            String(r.meanWeight),
            escapeCsv(r.remark),
          ].join(','),
      ),
      '',
      `Global Totals,${report.totals.totalHead},${report.totals.totalCalves},${report.totals.totalAlerts},${report.totals.meanWeightAll},${escapeCsv(report.totals.globalRemark)}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:]/g, '-').replace(/\..+$/, '');
    a.href = url;
    a.download = `turner-herd-report-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  TurnerRangelandMap.prototype._showHerdReport = function () {
    const report = this._buildHerdReport();
    const summaryHtml = report.ranchSummaries
      .map(
        (r) => `<li><strong>${escapeHtml(r.ranch)}</strong> — ${r.headCount.toLocaleString()} heads · calves ${r.calves.toLocaleString()} · flagged ${r.alerts.toLocaleString()} · mean ${r.meanWeight.toLocaleString()} lbs<br><span class="tb-report-remark">${escapeHtml(r.remark)}</span></li>`,
      )
      .join('');
    this._showPanel(
      'Full herd roster report',
      'By ranch totals, remarks, and downloadable full list',
      `<div class="tb-report-actions">
        <button type="button" class="tb-chart-btn tb-chart-btn--download" id="tb-download-herd-csv">Download full herd list (.csv)</button>
      </div>
      <ul class="tb-detail-list">
        <li><strong>Total heads</strong> ${report.totals.totalHead.toLocaleString()}</li>
        <li><strong>Total calves</strong> ${report.totals.totalCalves.toLocaleString()}</li>
        <li><strong>Flagged heads</strong> ${report.totals.totalAlerts.toLocaleString()}</li>
        <li><strong>Mean est. weight</strong> ${report.totals.meanWeightAll.toLocaleString()} lbs</li>
      </ul>
      <p class="tb-est-note">${escapeHtml(report.totals.globalRemark)}</p>
      <ul class="tb-detail-list tb-report-list">${summaryHtml}</ul>`,
    );
    const btn = this.root.querySelector('#tb-download-herd-csv');
    if (btn) btn.addEventListener('click', () => this.downloadHerdReport(), { once: true });
  };

  TurnerRangelandMap.prototype._hidePanel = function () {
    this.root.querySelector('#tb-chart-panel').hidden = true;
  };

  TurnerRangelandMap.prototype._showBison = function (b) {
    const sexCodes = ['M', 'F', 'C'];
    const sexLabels = ['Male', 'Female', 'Calf'];
    const sex =
      b.sex != null && sexLabels[b.sex] != null ? sexLabels[b.sex] : '—';
    const sexCode =
      b.sex != null && sexCodes[b.sex] != null ? sexCodes[b.sex] : '—';
    const w = b.weightLbs ?? estimateBisonWeightLbs(b, {
      meanWeightLbs: this._meanWeightLbs,
      placementSeed: this._radar?.placementSeed,
      syntheticDataAllowed: this.stream?.syntheticDataAllowed === true,
    });
    const kg = Math.round(w * 0.453592);
    this._showPanel(
      `${sex} · ${b.pastureName}`,
      'Estimated mass · not scale-weighed · no GPS collar',
      `<ul class="tb-detail-list">
        <li><strong>ID</strong> ${b.id}</li>
        <li><strong>Sex</strong> ${sex} (${sexCode})</li>
        <li><strong>Est. live weight</strong> ${w.toLocaleString()} lbs (${kg.toLocaleString()} kg)</li>
        <li><strong>Mass method</strong> TESF ${(this._meanWeightLbs || 1100).toLocaleString()} lb cow-unit baseline · sex class · passive radar biomass proxy</li>
        <li><strong>Pheromone trail</strong> ${b.trails.length} samples (light green path)</li>
        <li><strong>Radar fix</strong> ${b.lat.toFixed(4)}°, ${b.lng.toFixed(4)}°</li>
      </ul>
      <p class="tb-est-note">Per-head weight is a model estimate for operations planning, not an individual scale or collar reading.</p>`,
    );
  };

  TurnerRangelandMap.prototype._showPasture = function (p) {
    const herd = this.bison.filter((b) => b.pastureId === p.id);
    const count = herd.length;
    const totalLbs = herd.reduce((s, b) => s + (b.weightLbs || 0), 0);
    const meanW = count ? Math.round(totalLbs / count) : 0;
    const tons = (totalLbs / 2000).toFixed(1);
    this._showPanel(
      p.name,
      p.state,
      `<ul class="tb-detail-list">
        <li><strong>Head on chart</strong> ${count.toLocaleString()}</li>
        <li><strong>Acres</strong> ${(p.acres || 0).toLocaleString()}</li>
        <li><strong>Mean est. weight</strong> ${meanW.toLocaleString()} lbs / head</li>
        <li><strong>Est. pasture biomass</strong> ${totalLbs.toLocaleString()} lbs (${tons} short tons)</li>
      </ul>
      <p class="tb-est-note">Weights are herd-model estimates from TESF public baseline, not individual measurements.</p>`,
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
