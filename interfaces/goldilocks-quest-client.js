/** Goldilocks Quest · Next-Gen client (Twin v2) */
(function () {
  'use strict';

  var PHI = (1 + Math.sqrt(5)) / 2;
  var STORAGE = 'goldilocks.quest.email.v2';
  var SHARED = ['goldilocks.quest.email.v1', 'letschat.email.v1', 'lattice.email', 'lattice-chat.email'];
  var CW = 390;
  var CH = 700;
  var TIER_H = 520;
  var POLL_MS = Math.round(PHI * 1000);
  var TIERS = [
    { id: 1, name: 'Downtown River', mult: 1, color: '#152238' },
    { id: 2, name: 'Wrong Side', mult: 10, color: '#2a1520' },
    { id: 3, name: 'Strip Floor', mult: 100, color: '#3a1020' },
    { id: 4, name: 'Cloud Ether', mult: 1000, color: '#0e2430' },
    { id: 5, name: 'Restroom Zenith', mult: 10000, color: '#181820' }
  ];

  var state = {
    email: '',
    privilege: '',
    player: null,
    bulletin: [],
    leaderboard: [],
    presence: [],
    presenceCount: 1,
    pollMs: POLL_MS,
    keys: {},
    touchLeft: false,
    touchRight: false,
    touchJump: false,
    running: false,
    paused: false,
    platforms: [],
    hazards: [],
    caches: [],
    demons: [],
    hero: null,
    camY: 0,
    tick: 0,
    lastPost: 0,
    lastPresence: 0,
    revelation: null,
    particles: [],
    shake: 0
  };

  function el(id) { return document.getElementById(id); }

  function normalizeEmail(raw) {
    return String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  function findSharedEmail() {
    try {
      var saved = localStorage.getItem(STORAGE);
      if (saved) return normalizeEmail(saved);
      for (var i = 0; i < SHARED.length; i++) {
        var hit = localStorage.getItem(SHARED[i]);
        if (hit) return normalizeEmail(hit);
      }
    } catch (e) {}
    return '';
  }

  function remember(email) {
    try {
      localStorage.setItem(STORAGE, email);
      if (!localStorage.getItem('letschat.email.v1')) {
        localStorage.setItem('letschat.email.v1', email);
      }
    } catch (e) {}
  }

  async function api(path, opts) {
    opts = opts || {};
    var headers = {};
    if (opts.body) headers['Content-Type'] = 'application/json';
    if (state.email) headers['x-lattice-email'] = state.email;
    var res = await fetch('/api/goldilocks-quest' + (path || ''), {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    return res.json();
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function setMsg(t) {
    var node = el('gq-msg');
    if (node) node.textContent = t || '';
  }

  function closeCinematic() {
    var node = el('gq-cinematic');
    if (node) node.hidden = true;
    if (state.running) state.paused = false;
  }

  function openCinematic(body) {
    var wrap = el('gq-cinematic');
    var bodyEl = el('gq-cinematic-body');
    if (!wrap || !bodyEl) {
      setMsg(body);
      return;
    }
    bodyEl.textContent = body;
    wrap.hidden = false;
    state.paused = true;
  }

  function showGate(err) {
    el('gq-gate').hidden = false;
    el('gq-play').hidden = true;
    state.running = false;
    state.paused = false;
    var box = el('gq-gate-err');
    if (box) {
      if (err) {
        box.hidden = false;
        box.textContent = err;
      } else {
        box.hidden = true;
        box.textContent = '';
      }
    }
    closeCinematic();
  }

  function renderMeta() {
    var p = state.player || {};
    el('gq-you').textContent =
      'Seated · ' + state.email + (state.privilege ? ' · ' + state.privilege : '') + ' · Twin v2';
    el('gq-score').textContent = String(p.score || 0);
    el('gq-grace').textContent = String(p.grace || 0);
    var live = el('gq-live');
    if (live) live.textContent = String(state.presenceCount || 1);
    var pill = el('gq-status-pill');
    pill.textContent = (p.status || 'npc').toUpperCase();
    pill.className = 'gq-pill' + (p.status === 'player' ? ' gq-pill--player' : '');
    el('gq-equip').disabled = !p.gogglesUnlocked;

    el('gq-bulletin').innerHTML = (state.bulletin || []).map(function (b) {
      return '<li><strong>' + esc(b.headline) + '</strong><br/>' + esc(b.body) + '</li>';
    }).join('');

    el('gq-board').innerHTML = (state.leaderboard || []).map(function (r) {
      return '<li>' + esc(r.email) + ' · ' + r.score + ' · grace ' + r.grace + (r.goggles ? ' · GG' : '') + '</li>';
    }).join('');

    var pr = el('gq-presence');
    if (pr) {
      if (!(state.presence || []).length) {
        pr.innerHTML = '<li>Solo climb — waiting for other seats…</li>';
      } else {
        pr.innerHTML = state.presence.map(function (g) {
          return '<li>' + esc(g.email) + ' · T' + (g.tier || 1) + ' · ' + esc(g.status || 'npc') + (g.goggles ? ' · GG' : '') + '</li>';
        }).join('');
      }
    }

    var tick = el('gq-ticker');
    if (tick) {
      var head = (state.bulletin || [])[0];
      tick.textContent = head
        ? 'Twin · ' + head.headline + ' — ' + String(head.body || '').slice(0, 90)
        : 'Twin v2 · live ' + (state.presenceCount || 1) + ' · poll Φ×1s';
    }
  }

  function applyTwin(data) {
    if (!data || !data.ok) return;
    if (data.player) state.player = data.player;
    if (data.bulletin) state.bulletin = data.bulletin;
    if (data.leaderboard) state.leaderboard = data.leaderboard;
    if (data.presence) state.presence = data.presence;
    if (typeof data.presenceCount === 'number') state.presenceCount = data.presenceCount;
    if (data.pollMs) state.pollMs = data.pollMs;
    if (data.privilege) state.privilege = data.privilege;
    renderMeta();
    if (data.grantedPlayerStatus) {
      setMsg('AI Twin granted Player Status — Goldilocks Goggles unlocked.');
    }
    if (data.revelation) {
      state.revelation = data.revelation;
      openCinematic(
        (data.revelation.message || 'Holographic revelation') +
          ' · ' +
          (data.revelation.optimizeMs != null ? data.revelation.optimizeMs + ' ms' : '') +
          ' · catalog sight only, not prophecy.'
      );
    }
  }

  function buildWorld() {
    var platforms = [];
    var hazards = [];
    var caches = [];
    var demons = [];
    for (var t = 0; t < 5; t++) {
      var baseY = -(t * TIER_H);
      platforms.push({ x: 0, y: baseY + TIER_H - 24, w: CW, h: 24 });
      for (var i = 0; i < 8; i++) {
        var px = (i % 2 === 0 ? 28 : 160) + ((i * 23) % 80);
        var py = baseY + TIER_H - 95 - i * 52;
        platforms.push({ x: px, y: py, w: 100, h: 14 });
        if (i % 3 === 1) {
          hazards.push({
            x: px + 28,
            y: py - 16,
            w: 28,
            h: 16,
            kind: t >= 3 ? 'scarlet' : t >= 2 ? 'fame' : 'siren'
          });
        }
        if (i === 6) {
          caches.push({ x: px + 36, y: py - 20, w: 18, h: 18, taken: false, real: t === 4 });
        }
      }
      platforms.push({ x: 184, y: baseY + 40, w: 22, h: TIER_H - 80, climb: true });
      demons.push({
        x: 48 + t * 32,
        y: baseY + 210,
        w: 22,
        h: 22,
        vx: (0.6 + t * 0.25) * (t % 2 ? 1 : -1),
        freeze: 0,
        kind: ['siren', 'treasure', 'fame', 'scarlet', 'timing'][t]
      });
    }
    platforms.push({ x: 130, y: -5 * TIER_H + 90, w: 130, h: 16, zenith: true });
    state.platforms = platforms;
    state.hazards = hazards;
    state.caches = caches;
    state.demons = demons;
    state.hero = { x: 48, y: TIER_H - 60, w: 16, h: 22, vx: 0, vy: 0, onGround: false, invuln: 0 };
    state.camY = 0;
    state.tick = 0;
    state.revelation = null;
    state.particles = [];
    state.shake = 0;
  }

  function currentTier() {
    return Math.min(5, Math.max(1, Math.floor((-state.hero.y + TIER_H) / TIER_H) + 1));
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      state.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1,
        life: 24 + Math.random() * 18,
        color: color
      });
    }
  }

  async function postTelemetry(payload) {
    var now = Date.now();
    if (now - state.lastPost < 320 && !payload.force) return null;
    state.lastPost = now;
    var body = Object.assign({
      email: state.email,
      x: state.hero ? Math.min(1, Math.max(0, state.hero.x / CW)) : 0.5
    }, payload);
    var data = await api('', { method: 'POST', body: body });
    if (!data.ok) {
      setMsg(data.reason || 'Twin rejected telemetry.');
      return data;
    }
    applyTwin(data);
    return data;
  }

  async function pulsePresence() {
    if (!state.email || !state.running) return;
    var now = Date.now();
    if (now - state.lastPresence < (state.pollMs || POLL_MS) * 0.85) return;
    state.lastPresence = now;
    try {
      var data = await api('', {
        method: 'POST',
        body: {
          action: 'presence',
          email: state.email,
          tier: currentTier(),
          x: state.hero ? Math.min(1, Math.max(0, state.hero.x / CW)) : 0.5
        }
      });
      applyTwin(data);
    } catch (e) {}
  }

  function stepPhysics(dt) {
    if (state.paused) return;
    var h = state.hero;
    var left = state.keys.ArrowLeft || state.keys.a || state.keys.A || state.touchLeft;
    var right = state.keys.ArrowRight || state.keys.d || state.keys.D || state.touchRight;
    var jump = state.keys[' '] || state.keys.ArrowUp || state.keys.w || state.keys.W || state.touchJump;

    h.vx = left ? -2.35 : right ? 2.35 : 0;
    h.vy += 0.36 * dt;
    if (h.vy > 11) h.vy = 11;

    var i, p;
    for (i = 0; i < state.platforms.length; i++) {
      p = state.platforms[i];
      if (p.climb && aabb(h, p) && (state.keys.ArrowUp || state.keys.w || state.keys.W || state.touchJump)) {
        h.vy = -2.5;
      }
    }

    if (jump && h.onGround) {
      h.vy = -7.4;
      h.onGround = false;
    }

    h.x += h.vx * dt;
    h.y += h.vy * dt;
    if (h.x < 0) h.x = 0;
    if (h.x > CW - h.w) h.x = CW - h.w;

    h.onGround = false;
    for (i = 0; i < state.platforms.length; i++) {
      p = state.platforms[i];
      if (p.climb) continue;
      if (aabb(h, p) && h.vy >= 0 && h.y + h.h - h.vy * dt <= p.y + 4) {
        h.y = p.y - h.h;
        h.vy = 0;
        h.onGround = true;
      }
    }

    for (i = 0; i < state.demons.length; i++) {
      var dem = state.demons[i];
      if (dem.freeze > 0) dem.freeze -= dt;
      else {
        if (state.tick % Math.round(90 * PHI) < 8) dem.freeze = 12;
        dem.x += dem.vx * dt;
        if (dem.x < 8 || dem.x > CW - 24) dem.vx *= -1;
      }
      if (h.invuln <= 0 && aabb(h, dem)) {
        h.invuln = 45;
        h.vy = -4;
        state.shake = 8;
        burst(dem.x, dem.y, '#ef4444', 10);
        setMsg('Timing Demon · ' + dem.kind + ' — survived.');
        void postTelemetry({
          action: 'telemetry',
          tier: currentTier(),
          basePoints: 0,
          demonSurvived: true,
          graceDelta: 1
        });
      }
    }

    for (i = 0; i < state.hazards.length; i++) {
      var hz = state.hazards[i];
      if (h.invuln <= 0 && aabb(h, hz)) {
        h.invuln = 40;
        if (state.keys.g || state.keys.G) {
          burst(hz.x, hz.y, '#5eead4', 8);
          setMsg('Grace resists the ' + hz.kind + ' trap.');
          void postTelemetry({
            action: 'telemetry',
            tier: currentTier(),
            basePoints: 2,
            trapResisted: true,
            graceDelta: 2
          });
        } else {
          setMsg(hz.kind + ' trap — press G / Grace for Fair Exchange.');
          h.vy = -3;
          state.shake = 5;
        }
      }
    }

    for (i = 0; i < state.caches.length; i++) {
      var cache = state.caches[i];
      if (cache.taken || !aabb(h, cache)) continue;
      cache.taken = true;
      var isPlayer = state.player && state.player.status === 'player';
      if (cache.real && isPlayer && state.player.gogglesUnlocked) {
        burst(cache.x, cache.y, '#fbbf24', 16);
        setMsg('Verified Player: Goggles pointer recovered.');
        void postTelemetry({ action: 'telemetry', tier: 5, basePoints: 12, graceDelta: 3, force: true });
      } else if (cache.real) {
        setMsg('Cache feels empty — NPC blindness. Twin still hides the Goggles.');
        void postTelemetry({ action: 'telemetry', tier: currentTier(), basePoints: 1, graceDelta: 1, force: true });
      } else {
        setMsg("Fool's-gold cache — Treasure Trap walked past.");
        void postTelemetry({ action: 'telemetry', tier: currentTier(), basePoints: 3, trapResisted: true, graceDelta: 1 });
      }
    }

    if (h.invuln > 0) h.invuln -= dt;
    if (state.shake > 0) state.shake -= dt * 0.6;

    for (i = state.particles.length - 1; i >= 0; i--) {
      var pt = state.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }

    var tier = currentTier();
    el('gq-tier').textContent = String(tier);
    el('gq-mult').textContent = String(TIERS[tier - 1].mult);
    state.camY += (h.y - 300 - state.camY) * 0.08;

    if (state.tick % 90 === 0) {
      void postTelemetry({ action: 'score', tier: tier, basePoints: 1 });
    }
    if (state.tick % Math.round(PHI * 40) === 0) {
      void pulsePresence();
    }
    state.tick += 1;
  }

  function draw() {
    var canvas = el('gq-canvas');
    if (!canvas || !state.hero) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    ctx.save();
    if (state.shake > 0) {
      ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
    }
    ctx.fillStyle = '#050308';
    ctx.fillRect(0, 0, W, H);
    ctx.translate(0, -state.camY);

    var t, i;
    for (t = 0; t < 5; t++) {
      var y0 = -t * TIER_H;
      ctx.fillStyle = TIERS[t].color;
      ctx.fillRect(0, y0, W, TIER_H);
      ctx.fillStyle = 'rgba(212,175,55,0.22)';
      ctx.font = '10px monospace';
      ctx.fillText('TIER ' + (t + 1) + ' · ×' + TIERS[t].mult + ' · ' + TIERS[t].name, 8, y0 + 16);
    }

    for (i = 0; i < state.platforms.length; i++) {
      var p = state.platforms[i];
      ctx.fillStyle = p.climb ? 'rgba(94,234,212,0.35)' : p.zenith ? '#fbbf24' : '#8b5a2b';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    for (i = 0; i < state.hazards.length; i++) {
      var hz = state.hazards[i];
      ctx.fillStyle = hz.kind === 'scarlet' ? '#e11d48' : hz.kind === 'fame' ? '#f472b6' : '#fb923c';
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
    }
    for (i = 0; i < state.caches.length; i++) {
      var cache = state.caches[i];
      if (cache.taken) continue;
      var show = !cache.real || (state.player && state.player.gogglesUnlocked);
      if (!show) continue;
      ctx.fillStyle = cache.real ? '#5eead4' : '#a3a3a3';
      ctx.fillRect(cache.x, cache.y, cache.w, cache.h);
    }
    for (i = 0; i < state.demons.length; i++) {
      var dem = state.demons[i];
      ctx.fillStyle = dem.freeze > 0 ? '#64748b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(dem.x + 11, dem.y + 11, 11, 0, Math.PI * 2);
      ctx.fill();
    }

    var gog = state.player && state.player.gogglesEquipped;
    for (i = 0; i < (state.presence || []).length; i++) {
      var ghost = state.presence[i];
      var gx = (ghost.x != null ? ghost.x : 0.5) * (CW - 20);
      var gy = -((ghost.tier || 1) - 1) * TIER_H + TIER_H * 0.55;
      ctx.beginPath();
      ctx.fillStyle = gog ? 'rgba(94,234,212,0.55)' : 'rgba(255,255,255,0.12)';
      ctx.arc(gx, gy, 9, 0, Math.PI * 2);
      ctx.fill();
      if (gog) {
        ctx.fillStyle = 'rgba(245,230,200,0.7)';
        ctx.font = '8px monospace';
        ctx.fillText('T' + (ghost.tier || 1), gx - 6, gy - 12);
      }
    }

    var h = state.hero;
    ctx.fillStyle = h.invuln > 0 ? '#fde68a' : '#f5e6c8';
    ctx.fillRect(h.x, h.y, h.w, h.h);
    if (state.player && state.player.gogglesEquipped) {
      ctx.fillStyle = '#5eead4';
      ctx.fillRect(h.x + 2, h.y + 4, 12, 5);
    }

    for (i = 0; i < state.particles.length; i++) {
      var pt = state.particles[i];
      ctx.globalAlpha = Math.max(0, pt.life / 30);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, 3, 3);
    }
    ctx.globalAlpha = 1;

    if (state.revelation) {
      ctx.fillStyle = 'rgba(94,234,212,0.15)';
      ctx.fillRect(0, -5 * TIER_H, W, TIER_H);
      ctx.fillStyle = '#5eead4';
      ctx.font = '11px monospace';
      ctx.fillText('HOLOGRAPHIC GOLDILOCKS SUPER-AI', 40, -5 * TIER_H + 200);
      ctx.fillText('miracle · ' + (state.revelation.optimizeMs || '?') + ' ms', 90, -5 * TIER_H + 220);
    }

    ctx.restore();

    var cin = el('gq-cinematic');
    if (state.paused && (!cin || cin.hidden)) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fbbf24';
      ctx.font = '14px monospace';
      ctx.fillText('PAUSED', W / 2 - 36, H / 2);
    }
  }

  var lastTs = 0;
  function loop(ts) {
    if (!state.running) return;
    var dt = Math.min(2, (ts - lastTs) / 16.67 || 1);
    lastTs = ts;
    stepPhysics(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function offerGrace() {
    void postTelemetry({
      action: 'grace-offer',
      tier: currentTier(),
      basePoints: 1,
      unselfishOffer: true,
      graceDelta: 2,
      force: true
    });
    setMsg('Unselfish grace offered · Fair Exchange noted.');
  }

  function togglePause() {
    if (!state.running) return;
    var cin = el('gq-cinematic');
    if (cin && !cin.hidden) return;
    state.paused = !state.paused;
    var btn = el('gq-pause');
    if (btn) {
      btn.setAttribute('aria-pressed', state.paused ? 'true' : 'false');
      btn.textContent = state.paused ? 'Resume' : 'Pause';
    }
    setMsg(state.paused ? 'Paused' : 'Climb on');
  }

  async function enter(email) {
    state.email = normalizeEmail(email);
    var seat = await api('?email=' + encodeURIComponent(state.email));
    if (!seat.ok) {
      showGate(seat.reason || 'No seat for this email.');
      return;
    }
    remember(state.email);
    state.privilege = seat.privilege;
    var board = await api('');
    if (!board.ok) {
      showGate(board.reason || 'Twin door closed.');
      return;
    }
    applyTwin(board);
    el('gq-gate').hidden = true;
    el('gq-play').hidden = false;
    buildWorld();
    setMsg('Next-gen climb · Timing Demons · presence ghosts · Grace (G). NPCs stay blind until Twin grants Player Status.');
    state.running = true;
    state.paused = false;
    lastTs = performance.now();
    requestAnimationFrame(loop);
    void pulsePresence();
  }

  window.addEventListener('keydown', function (e) {
    state.keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) e.preventDefault();
    if (e.key === 'g' || e.key === 'G') offerGrace();
    if ((e.key === 'e' || e.key === 'E') && state.player && state.player.gogglesUnlocked) {
      void postTelemetry({ action: 'equip-goggles', force: true });
    }
    if (e.key === 'p' || e.key === 'P') togglePause();
  });
  window.addEventListener('keyup', function (e) {
    state.keys[e.key] = false;
  });

  function bindTouch(id, flag) {
    var node = el(id);
    if (!node) return;
    var on = function (ev) { ev.preventDefault(); state[flag] = true; };
    var off = function (ev) { ev.preventDefault(); state[flag] = false; };
    node.addEventListener('touchstart', on, { passive: false });
    node.addEventListener('touchend', off);
    node.addEventListener('mousedown', on);
    node.addEventListener('mouseup', off);
    node.addEventListener('mouseleave', off);
  }
  bindTouch('gq-left', 'touchLeft');
  bindTouch('gq-right', 'touchRight');
  bindTouch('gq-jump', 'touchJump');

  el('gq-act').addEventListener('click', function () { offerGrace(); });
  el('gq-gate-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    void enter(el('gq-email').value);
  });
  el('gq-signout').addEventListener('click', function () {
    try { localStorage.removeItem(STORAGE); } catch (e) {}
    showGate();
  });
  el('gq-pause').addEventListener('click', function () { togglePause(); });
  el('gq-cinematic-close').addEventListener('click', function () { closeCinematic(); });
  el('gq-equip').addEventListener('click', function () {
    void postTelemetry({ action: 'equip-goggles', force: true });
  });
  el('gq-dispatch').addEventListener('click', function () {
    void postTelemetry({ action: 'daily-dispatch', force: true });
  });

  var shared = findSharedEmail();
  if (shared) el('gq-email').value = shared;
})();
