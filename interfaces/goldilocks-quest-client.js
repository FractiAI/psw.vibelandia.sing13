/** Goldilocks Quest · Full Gen client (full-gen-v3) · IIFE · no build step */
(function () {
  'use strict';

  var PHI = (1 + Math.sqrt(5)) / 2;
  var GENERATION = 'full-gen-v3';
  var STORAGE = 'goldilocks.quest.email.v3';
  var SHARED = [
    'goldilocks.quest.email.v3',
    'goldilocks.quest.email.v2',
    'goldilocks.quest.email.v1',
    'letschat.email.v1',
    'lattice.email',
    'lattice-chat.email'
  ];
  var CW = 390;
  var CH = 700;
  var TIER_H = 520;
  var POLL_MS = Math.round(PHI * 1000);
  var TIERS = [
    { id: 1, name: 'Forgotten Downtown · Rebel River', mult: 1, color: '#152238' },
    { id: 2, name: 'Wrong Side of Town', mult: 10, color: '#2a1520' },
    { id: 3, name: 'Seedy Strip · Main Floor', mult: 100, color: '#3a1020' },
    { id: 4, name: 'Internet Cloud · Digital Ether', mult: 1000, color: '#0e2430' },
    { id: 5, name: "Men's Restroom · Ultimate Sanctuary", mult: 10000, color: '#181820' }
  ];

  var state = {
    email: '',
    privilege: '',
    player: null,
    bulletin: [],
    leaderboard: [],
    presence: [],
    presenceCount: 1,
    hazardsSchedule: null,
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
    scarletNpcs: [],
    hero: null,
    camY: 0,
    tick: 0,
    lastPost: 0,
    lastPresence: 0,
    lastPoll: 0,
    revelation: null,
    particles: [],
    shake: 0,
    streamAbort: null,
    pollTimer: null,
    runCompleteSent: false,
    audioCtx: null
  };

  function el(id) {
    return document.getElementById(id);
  }

  function normalizeEmail(raw) {
    return String(raw || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function findSharedEmail() {
    try {
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
      if (!localStorage.getItem('lattice.email')) {
        localStorage.setItem('lattice.email', email);
      }
    } catch (e) {}
  }

  function ensureAudio() {
    if (state.audioCtx) return state.audioCtx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      state.audioCtx = new AC();
      return state.audioCtx;
    } catch (e) {
      return null;
    }
  }

  /** Soft beeps — fail-soft if Web Audio unavailable. */
  function beep(kind) {
    try {
      var ctx = ensureAudio();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(function () {});
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      var now = ctx.currentTime;
      var freq = 440;
      var dur = 0.08;
      if (kind === 'jump') {
        freq = 520;
        dur = 0.06;
      } else if (kind === 'grace') {
        freq = 660;
        dur = 0.1;
      } else if (kind === 'demon') {
        freq = 180;
        dur = 0.14;
      } else if (kind === 'reveal') {
        freq = 880;
        dur = 0.28;
      }
      o.type = kind === 'demon' ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now);
      o.stop(now + dur + 0.02);
    } catch (e) {}
  }

  async function api(path, opts) {
    opts = opts || {};
    var headers = {};
    if (opts.body) headers['Content-Type'] = 'application/json';
    if (state.email) headers['x-lattice-email'] = state.email;
    if (opts.accept) headers.Accept = opts.accept;
    var res = await fetch('/api/goldilocks-quest' + (path || ''), {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal
    });
    if (opts.raw) return res;
    return res.json();
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function setMsg(t) {
    var node = el('gq-msg');
    if (node) node.textContent = t || '';
  }

  function canSeeRealGoggles() {
    var p = state.player;
    return !!(p && p.status === 'player' && p.gogglesUnlocked);
  }

  function applyVisionClass() {
    var wrap = document.querySelector('.gq-stage-wrap');
    var play = el('gq-play');
    var on = !!(state.player && state.player.gogglesEquipped);
    if (wrap) wrap.classList.toggle('gq-vision', on);
    if (play) play.classList.toggle('gq-vision', on);
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
    beep('reveal');
  }

  function showGate(err) {
    el('gq-gate').hidden = false;
    el('gq-play').hidden = true;
    state.running = false;
    state.paused = false;
    stopLive();
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
    applyVisionClass();
  }

  function renderMeta() {
    var p = state.player || {};
    el('gq-you').textContent =
      'Seated · ' +
      state.email +
      (state.privilege ? ' · ' + state.privilege : '') +
      ' · ' +
      GENERATION;
    el('gq-score').textContent = String(p.score || 0);
    el('gq-grace').textContent = String(p.grace || 0);
    var live = el('gq-live');
    if (live) live.textContent = String(state.presenceCount || 1);
    var pill = el('gq-status-pill');
    pill.textContent = (p.status || 'npc').toUpperCase();
    pill.className = 'gq-pill' + (p.status === 'player' ? ' gq-pill--player' : '');
    el('gq-equip').disabled = !p.gogglesUnlocked;
    el('gq-equip').textContent = p.gogglesEquipped ? 'Goggles equipped' : 'Equip Goggles';
    applyVisionClass();

    el('gq-bulletin').innerHTML = (state.bulletin || [])
      .map(function (b) {
        return '<li><strong>' + esc(b.headline) + '</strong><br/>' + esc(b.body) + '</li>';
      })
      .join('');

    el('gq-board').innerHTML = (state.leaderboard || [])
      .map(function (r) {
        return (
          '<li>' +
          esc(r.email) +
          ' · ' +
          r.score +
          ' · grace ' +
          r.grace +
          (r.goggles ? ' · GG' : '') +
          '</li>'
        );
      })
      .join('');

    var pr = el('gq-presence');
    if (pr) {
      if (!(state.presence || []).length) {
        pr.innerHTML = '<li>Solo climb — waiting for other seats…</li>';
      } else {
        pr.innerHTML = state.presence
          .map(function (g) {
            return (
              '<li>' +
              esc(g.email) +
              ' · T' +
              (g.tier || 1) +
              ' · ' +
              esc(g.status || 'npc') +
              (g.goggles ? ' · GG' : '') +
              '</li>'
            );
          })
          .join('');
      }
    }

    var tick = el('gq-ticker');
    if (tick) {
      var head = (state.bulletin || [])[0];
      tick.textContent = head
        ? 'Twin · ' + head.headline + ' — ' + String(head.body || '').slice(0, 90)
        : GENERATION + ' · live ' + (state.presenceCount || 1) + ' · Φ poll';
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
    if (data.hazards) state.hazardsSchedule = data.hazards;
    if (Array.isArray(data.tiers) && data.tiers.length === 5) {
      for (var i = 0; i < 5; i++) {
        if (data.tiers[i].name) TIERS[i].name = data.tiers[i].name;
        if (data.tiers[i].multiplier != null) TIERS[i].mult = data.tiers[i].multiplier;
      }
    }
    renderMeta();
    if (data.grantedPlayerStatus) {
      setMsg('AI Twin granted Player Status — Goldilocks Goggles unlocked (' + GENERATION + ').');
      beep('grace');
    }
    if (data.revelation) {
      state.revelation = data.revelation;
      openCinematic(
        (data.revelation.message || 'Holographic revelation') +
          ' · ' +
          (data.revelation.optimizeMs != null ? data.revelation.optimizeMs + ' ms' : '') +
          (data.revelation.token ? ' · token ' + data.revelation.token : '') +
          ' · catalog sight only · arcade companion, not physics.'
      );
    } else if (data.miracle && data.miracle.optimizeMs != null && !data.revelation) {
      setMsg('Miracle residual · ' + data.miracle.optimizeMs + ' ms · ' + GENERATION);
    }
  }

  function buildWorld() {
    var platforms = [];
    var hazards = [];
    var caches = [];
    var demons = [];
    var scarletNpcs = [];
    for (var t = 0; t < 5; t++) {
      var baseY = -(t * TIER_H);
      platforms.push({ x: 0, y: baseY + TIER_H - 24, w: CW, h: 24 });
      for (var i = 0; i < 8; i++) {
        var px = (i % 2 === 0 ? 28 : 160) + ((i * 23) % 80);
        var py = baseY + TIER_H - 95 - i * 52;
        platforms.push({ x: px, y: py, w: 100, h: 14 });
        var trapKind =
          t === 0
            ? i % 2 === 0
              ? 'siren'
              : 'scarlet'
            : t === 1
              ? ['siren', 'scarlet', 'treasure'][i % 3]
              : t === 2
                ? ['fame', 'treasure', 'siren'][i % 3]
                : t === 3
                  ? ['fame', 'treasure', 'siren'][i % 3]
                  : 'siren';
        if (i % 3 === 1) {
          hazards.push({
            x: px + 28,
            y: py - 16,
            w: 28,
            h: 16,
            kind: trapKind
          });
        }
        if (i === 6) {
          caches.push({
            x: px + 36,
            y: py - 20,
            w: 18,
            h: 18,
            taken: false,
            real: t === 4
          });
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
        phase: 0,
        kind: 'timing'
      });
      if (t <= 2) {
        scarletNpcs.push({
          x: 300,
          y: baseY + TIER_H - 120,
          w: 18,
          h: 22,
          helped: false,
          tier: t + 1
        });
      }
    }
    platforms.push({ x: 130, y: -5 * TIER_H + 90, w: 130, h: 16, zenith: true });
    state.platforms = platforms;
    state.hazards = hazards;
    state.caches = caches;
    state.demons = demons;
    state.scarletNpcs = scarletNpcs;
    state.hero = {
      x: 48,
      y: TIER_H - 60,
      w: 16,
      h: 22,
      vx: 0,
      vy: 0,
      onGround: false,
      invuln: 0
    };
    state.camY = 0;
    state.tick = 0;
    state.revelation = null;
    state.particles = [];
    state.shake = 0;
    state.runCompleteSent = false;
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
    var body = Object.assign(
      {
        x: state.hero ? Math.min(1, Math.max(0, state.hero.x / CW)) : 0.5
      },
      payload
    );
    delete body.force;
    try {
      var data = await api('', { method: 'POST', body: body });
      if (!data.ok) {
        setMsg(data.reason || 'Twin rejected telemetry.');
        return data;
      }
      applyTwin(data);
      return data;
    } catch (e) {
      setMsg('Twin link soft-fail — climb continues locally.');
      return null;
    }
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
          tier: currentTier(),
          x: state.hero ? Math.min(1, Math.max(0, state.hero.x / CW)) : 0.5
        }
      });
      applyTwin(data);
    } catch (e) {}
  }

  async function pollState() {
    if (!state.email || !state.running) return;
    var now = Date.now();
    if (now - state.lastPoll < (state.pollMs || POLL_MS)) return;
    state.lastPoll = now;
    try {
      var data = await api('');
      applyTwin(data);
    } catch (e) {}
  }

  function stopLive() {
    if (state.streamAbort) {
      try {
        state.streamAbort.abort();
      } catch (e) {}
      state.streamAbort = null;
    }
    if (state.pollTimer) {
      clearInterval(state.pollTimer);
      state.pollTimer = null;
    }
  }

  function startPollFallback() {
    if (state.pollTimer) return;
    state.pollTimer = setInterval(function () {
      void pollState();
      void pulsePresence();
    }, state.pollMs || POLL_MS);
  }

  async function connectStream() {
    if (!state.email || !state.running) return;
    stopLive();
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    state.streamAbort = ctrl;
    startPollFallback();
    try {
      var res = await api('?stream=1', {
        accept: 'text/event-stream',
        signal: ctrl ? ctrl.signal : undefined,
        raw: true
      });
      if (!res.ok || !res.body || !res.body.getReader) {
        return;
      }
      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buf = '';
      var eventName = 'message';
      while (state.running) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buf += decoder.decode(chunk.value, { stream: true });
        var parts = buf.split('\n');
        buf = parts.pop() || '';
        for (var i = 0; i < parts.length; i++) {
          var line = parts[i];
          if (line.indexOf('event:') === 0) {
            eventName = line.slice(6).trim();
          } else if (line.indexOf('data:') === 0) {
            var raw = line.slice(5).trim();
            try {
              var payload = JSON.parse(raw);
              if (eventName === 'hello' || eventName === 'twin') {
                applyTwin(payload);
              } else if (eventName === 'bye') {
                eventName = 'message';
                if (payload && payload.reconnect && state.running) {
                  setTimeout(function () {
                    void connectStream();
                  }, state.pollMs || POLL_MS);
                }
                return;
              }
            } catch (e) {}
            eventName = 'message';
          } else if (!line) {
            eventName = 'message';
          }
        }
      }
      if (state.running) {
        setTimeout(function () {
          void connectStream();
        }, state.pollMs || POLL_MS);
      }
    } catch (e) {
      if (state.running) startPollFallback();
    }
  }

  function tryScarletMercy() {
    if (!state.hero) return false;
    var graceHeld = state.keys.g || state.keys.G;
    for (var i = 0; i < state.scarletNpcs.length; i++) {
      var npc = state.scarletNpcs[i];
      if (npc.helped) continue;
      var near = Math.hypot(state.hero.x - npc.x, state.hero.y - npc.y) < 36;
      if (near && graceHeld) {
        npc.helped = true;
        burst(npc.x, npc.y, '#fb7185', 12);
        beep('grace');
        setMsg('Scarlet mercy · you helped an NPC · Fair Exchange.');
        void postTelemetry({
          action: 'scarlet-mercy',
          tier: currentTier(),
          basePoints: 2,
          scarletMercy: true,
          unselfishOffer: true,
          graceDelta: 2,
          force: true
        });
        return true;
      }
    }
    for (var j = 0; j < state.hazards.length; j++) {
      var hz = state.hazards[j];
      if (hz.kind !== 'scarlet' || hz.helped) continue;
      if (aabb(state.hero, hz) && graceHeld) {
        hz.helped = true;
        burst(hz.x, hz.y, '#fb7185', 10);
        beep('grace');
        setMsg('Scarlet trap met with mercy.');
        void postTelemetry({
          action: 'scarlet-mercy',
          tier: currentTier(),
          basePoints: 2,
          scarletMercy: true,
          trapResisted: true,
          graceDelta: 2,
          force: true
        });
        return true;
      }
    }
    return false;
  }

  function stepPhysics(dt) {
    if (state.paused) return;
    var h = state.hero;
    var left = state.keys.ArrowLeft || state.keys.a || state.keys.A || state.touchLeft;
    var right = state.keys.ArrowRight || state.keys.d || state.keys.D || state.touchRight;
    var jump =
      state.keys[' '] || state.keys.ArrowUp || state.keys.w || state.keys.W || state.touchJump;

    h.vx = left ? -2.35 : right ? 2.35 : 0;
    h.vy += 0.36 * dt;
    if (h.vy > 11) h.vy = 11;

    var i, p;
    for (i = 0; i < state.platforms.length; i++) {
      p = state.platforms[i];
      if (
        p.climb &&
        aabb(h, p) &&
        (state.keys.ArrowUp || state.keys.w || state.keys.W || state.touchJump)
      ) {
        h.vy = -2.5;
      }
    }

    if (jump && h.onGround) {
      h.vy = -7.4;
      h.onGround = false;
      beep('jump');
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
        if (p.zenith && !state.runCompleteSent) {
          state.runCompleteSent = true;
          void postTelemetry({ action: 'run-complete', tier: 5, force: true });
          setMsg('Zenith · run complete · ' + GENERATION);
        }
      }
    }

    var phasePeriod = Math.round(90 * PHI);
    for (i = 0; i < state.demons.length; i++) {
      var dem = state.demons[i];
      dem.phase = (dem.phase || 0) + dt;
      if (dem.freeze > 0) dem.freeze -= dt;
      else {
        if (state.tick % phasePeriod < 8) dem.freeze = 12;
        dem.x += dem.vx * dt;
        if (dem.x < 8 || dem.x > CW - 24) dem.vx *= -1;
      }
      if (h.invuln <= 0 && aabb(h, dem) && dem.freeze <= 0) {
        h.invuln = 45;
        h.vy = -4;
        state.shake = 8;
        burst(dem.x, dem.y, '#ef4444', 10);
        beep('demon');
        setMsg('Timing Demon freeze/phase — survived.');
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
          beep('grace');
          if (hz.kind === 'scarlet') {
            setMsg('Grace + scarlet mercy.');
            void postTelemetry({
              action: 'scarlet-mercy',
              tier: currentTier(),
              basePoints: 2,
              trapResisted: true,
              scarletMercy: true,
              graceDelta: 2
            });
          } else {
            setMsg('Grace resists the ' + hz.kind + ' trap.');
            void postTelemetry({
              action: 'telemetry',
              tier: currentTier(),
              basePoints: 2,
              trapResisted: true,
              graceDelta: 2
            });
          }
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
      if (cache.real && canSeeRealGoggles()) {
        burst(cache.x, cache.y, '#fbbf24', 16);
        beep('grace');
        setMsg('Verified Player: Goggles pointer recovered.');
        void postTelemetry({
          action: 'telemetry',
          tier: 5,
          basePoints: 12,
          graceDelta: 3,
          force: true
        });
      } else if (cache.real) {
        setMsg('Cache feels empty — NPC blindness. Twin still hides the Goggles.');
        void postTelemetry({
          action: 'telemetry',
          tier: currentTier(),
          basePoints: 1,
          graceDelta: 1,
          force: true
        });
      } else {
        setMsg("Fool's-gold cache — Treasure Trap walked past.");
        void postTelemetry({
          action: 'telemetry',
          tier: currentTier(),
          basePoints: 3,
          trapResisted: true,
          graceDelta: 1
        });
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
    var vision = !!(state.player && state.player.gogglesEquipped);
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
      if (vision) {
        ctx.fillStyle = 'rgba(94,234,212,0.06)';
        ctx.fillRect(0, y0, W, TIER_H);
        ctx.strokeStyle = 'rgba(94,234,212,0.18)';
        ctx.beginPath();
        for (var gy = 0; gy < TIER_H; gy += 18) {
          ctx.moveTo(0, y0 + gy);
          ctx.lineTo(W, y0 + gy);
        }
        for (var gx = 0; gx < W; gx += 18) {
          ctx.moveTo(gx, y0);
          ctx.lineTo(gx, y0 + TIER_H);
        }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(212,175,55,0.22)';
      ctx.font = '10px monospace';
      ctx.fillText(
        'TIER ' + (t + 1) + ' · ×' + TIERS[t].mult + ' · ' + TIERS[t].name,
        8,
        y0 + 16
      );
    }

    for (i = 0; i < state.platforms.length; i++) {
      var p = state.platforms[i];
      ctx.fillStyle = p.climb ? 'rgba(94,234,212,0.35)' : p.zenith ? '#fbbf24' : '#8b5a2b';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    for (i = 0; i < state.hazards.length; i++) {
      var hz = state.hazards[i];
      ctx.fillStyle =
        hz.kind === 'scarlet'
          ? '#e11d48'
          : hz.kind === 'fame'
            ? '#f472b6'
            : hz.kind === 'treasure'
              ? '#fbbf24'
              : '#fb923c';
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
    }
    for (i = 0; i < state.scarletNpcs.length; i++) {
      var sn = state.scarletNpcs[i];
      ctx.fillStyle = sn.helped ? '#fda4af' : '#be123c';
      ctx.fillRect(sn.x, sn.y, sn.w, sn.h);
      ctx.fillStyle = 'rgba(245,230,200,0.55)';
      ctx.font = '8px monospace';
      ctx.fillText(sn.helped ? 'ok' : 'help?', sn.x - 4, sn.y - 4);
    }
    for (i = 0; i < state.caches.length; i++) {
      var cache = state.caches[i];
      if (cache.taken) continue;
      // NPC blindness: real Goggles cache invisible unless player + unlocked
      if (cache.real && !canSeeRealGoggles()) continue;
      ctx.fillStyle = cache.real ? '#5eead4' : '#a3a3a3';
      ctx.fillRect(cache.x, cache.y, cache.w, cache.h);
    }
    for (i = 0; i < state.demons.length; i++) {
      var dem = state.demons[i];
      var phased = dem.freeze > 0;
      ctx.globalAlpha = phased ? 0.35 : 1;
      ctx.fillStyle = phased ? '#64748b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(dem.x + 11, dem.y + 11, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (i = 0; i < (state.presence || []).length; i++) {
      var ghost = state.presence[i];
      var gxx = (ghost.x != null ? ghost.x : 0.5) * (CW - 20);
      var gyy = -((ghost.tier || 1) - 1) * TIER_H + TIER_H * 0.55;
      ctx.beginPath();
      ctx.fillStyle = vision ? 'rgba(94,234,212,0.55)' : 'rgba(255,255,255,0.12)';
      ctx.arc(gxx, gyy, 9, 0, Math.PI * 2);
      ctx.fill();
      if (vision) {
        ctx.fillStyle = 'rgba(245,230,200,0.85)';
        ctx.font = '8px monospace';
        ctx.fillText(
          String(ghost.email || '').slice(0, 10) + ' T' + (ghost.tier || 1),
          gxx - 18,
          gyy - 12
        );
      }
    }

    var h = state.hero;
    ctx.fillStyle = h.invuln > 0 ? '#fde68a' : '#f5e6c8';
    ctx.fillRect(h.x, h.y, h.w, h.h);
    if (vision) {
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
      ctx.fillText(
        'miracle · ' + (state.revelation.optimizeMs || '?') + ' ms · ' + GENERATION,
        70,
        -5 * TIER_H + 220
      );
    }

    ctx.restore();

    if (vision) {
      ctx.save();
      var grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, 'rgba(94,234,212,0.12)');
      grd.addColorStop(1, 'rgba(94,234,212,0.02)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(94,234,212,0.35)';
      ctx.strokeRect(2, 2, W - 4, H - 4);
      ctx.fillStyle = 'rgba(94,234,212,0.7)';
      ctx.font = '10px monospace';
      ctx.fillText('GOGGLES VISION · ' + GENERATION, 10, 18);
      ctx.restore();
    }

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
    if (tryScarletMercy()) return;
    beep('grace');
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
    setMsg(state.paused ? 'Paused' : 'Climb on · ' + GENERATION);
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
    setMsg(
      'Full Gen climb · ' +
        GENERATION +
        ' · Timing Demons · presence ghosts · Grace (G). NPCs stay blind until Twin grants Player Status. Arcade companion — no physics claims.'
    );
    state.running = true;
    state.paused = false;
    lastTs = performance.now();
    requestAnimationFrame(loop);
    void pulsePresence();
    void connectStream();
  }

  window.addEventListener('keydown', function (e) {
    state.keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].indexOf(e.key) >= 0) {
      e.preventDefault();
    }
    if (e.key === 'g' || e.key === 'G') offerGrace();
    if ((e.key === 'e' || e.key === 'E') && state.player && state.player.gogglesUnlocked) {
      void postTelemetry({ action: 'equip-goggles', force: true }).then(function (data) {
        if (data && data.ok && state.player && state.player.tierMax >= 5) {
          /* revelation handled in applyTwin */
        }
      });
    }
    if (e.key === 'p' || e.key === 'P') togglePause();
  });
  window.addEventListener('keyup', function (e) {
    state.keys[e.key] = false;
  });

  function bindTouch(id, flag) {
    var node = el(id);
    if (!node) return;
    var on = function (ev) {
      ev.preventDefault();
      state[flag] = true;
      ensureAudio();
    };
    var off = function (ev) {
      ev.preventDefault();
      state[flag] = false;
    };
    node.addEventListener('touchstart', on, { passive: false });
    node.addEventListener('touchend', off);
    node.addEventListener('mousedown', on);
    node.addEventListener('mouseup', off);
    node.addEventListener('mouseleave', off);
  }
  bindTouch('gq-left', 'touchLeft');
  bindTouch('gq-right', 'touchRight');
  bindTouch('gq-jump', 'touchJump');

  el('gq-act').addEventListener('click', function () {
    offerGrace();
  });
  el('gq-gate-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    ensureAudio();
    void enter(el('gq-email').value);
  });
  el('gq-signout').addEventListener('click', function () {
    try {
      localStorage.removeItem(STORAGE);
    } catch (e) {}
    showGate();
  });
  el('gq-pause').addEventListener('click', function () {
    togglePause();
  });
  el('gq-cinematic-close').addEventListener('click', function () {
    closeCinematic();
  });
  el('gq-equip').addEventListener('click', async function () {
    var data = await postTelemetry({ action: 'equip-goggles', force: true });
    if (
      data &&
      data.ok &&
      state.player &&
      state.player.gogglesEquipped &&
      currentTier() >= 5 &&
      !data.revelation
    ) {
      var mir = await postTelemetry({ action: 'miracle', force: true });
      if (mir && mir.miracle) {
        openCinematic(
          'Tier 5 · Goggles equipped · miracle ' +
            (mir.miracle.optimizeMs || '?') +
            ' ms · ' +
            GENERATION +
            ' · arcade companion only.'
        );
      }
    }
  });
  el('gq-dispatch').addEventListener('click', function () {
    void postTelemetry({ action: 'daily-dispatch', force: true });
  });

  var shared = findSharedEmail();
  if (shared) el('gq-email').value = shared;
})();
