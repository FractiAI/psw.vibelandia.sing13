/** Goldilocks Quest · client (matches HTML ids + /api/goldilocks-quest) */
(function () {
  var PHI = (1 + Math.sqrt(5)) / 2;
  var STORAGE = 'goldilocks.quest.email.v1';
  var SHARED = ['letschat.email.v1', 'lattice.email', 'lattice-chat.email'];
  var TIER_H = 520;
  var TIERS = [
    { id: 1, name: 'Downtown River', mult: 1, color: '#152238' },
    { id: 2, name: 'Wrong Side', mult: 10, color: '#2a1520' },
    { id: 3, name: 'Strip Floor', mult: 100, color: '#3a1020' },
    { id: 4, name: 'Cloud Ether', mult: 1000, color: '#0e2430' },
    { id: 5, name: 'Restroom Zenith', mult: 10000, color: '#181820' },
  ];

  var S = {
    email: '',
    privilege: '',
    player: null,
    bulletin: [],
    leaderboard: [],
    keys: {},
    touchLeft: false,
    touchRight: false,
    touchJump: false,
    running: false,
    platforms: [],
    hazards: [],
    caches: [],
    demons: [],
    hero: null,
    camY: 0,
    tick: 0,
    lastPost: 0,
    revelation: null,
  };

  function $(id) {
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
      var saved = localStorage.getItem(STORAGE);
      if (saved) return normalizeEmail(saved);
      for (var i = 0; i < SHARED.length; i++) {
        var hit = localStorage.getItem(SHARED[i]);
        if (hit) return normalizeEmail(hit);
      }
    } catch (_) {}
    return '';
  }

  function remember(email) {
    try {
      localStorage.setItem(STORAGE, email);
      if (!localStorage.getItem('letschat.email.v1')) {
        localStorage.setItem('letschat.email.v1', email);
      }
    } catch (_) {}
  }

  async function api(path, opts) {
    opts = opts || {};
    var headers = {};
    if (opts.body) headers['Content-Type'] = 'application/json';
    if (S.email) headers['x-lattice-email'] = S.email;
    var res = await fetch('/api/goldilocks-quest' + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    return res.json();
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function setMsg(t) {
    $('gq-msg').textContent = t || '';
  }

  function showGate(err) {
    $('gq-gate').hidden = false;
    $('gq-play').hidden = true;
    S.running = false;
    var box = $('gq-gate-err');
    if (err) {
      box.hidden = false;
      box.textContent = err;
    } else {
      box.hidden = true;
      box.textContent = '';
    }
  }

  function renderMeta() {
    var p = S.player || {};
    $('gq-you').textContent =
      'Seated · ' + S.email + (S.privilege ? ' · ' + S.privilege : '');
    $('gq-score').textContent = String(p.score || 0);
    $('gq-grace').textContent = String(p.grace || 0);
    var pill = $('gq-status-pill');
    pill.textContent = (p.status || 'npc').toUpperCase();
    pill.className = 'gq-pill' + (p.status === 'player' ? ' gq-pill--player' : '');
    $('gq-equip').disabled = !p.gogglesUnlocked;
    $('gq-bulletin').innerHTML = (S.bulletin || [])
      .map(function (b) {
        return '<li><strong>' + esc(b.headline) + '</strong><br/>' + esc(b.body) + '</li>';
      })
      .join('');
    $('gq-board').innerHTML = (S.leaderboard || [])
      .map(function (r) {
        return (
          '<li>' +
          esc(r.email) +
          ' · ' +
          r.score +
          ' · grace ' +
          r.grace +
          (r.goggles ? ' · 🥽' : '') +
          '</li>'
        );
      })
      .join('');
  }

  function buildWorld() {
    var platforms = [];
    var hazards = [];
    var caches = [];
    var demons = [];
    for (var t = 0; t < 5; t++) {
      var baseY = -(t * TIER_H);
      platforms.push({ x: 0, y: baseY + TIER_H - 24, w: 360, h: 24 });
      for (var i = 0; i < 7; i++) {
        var px = (i % 2 === 0 ? 28 : 140) + ((i * 19) % 70);
        var py = baseY + TIER_H - 95 - i * 56;
        platforms.push({ x: px, y: py, w: 92, h: 14 });
        if (i % 3 === 1) {
          hazards.push({
            x: px + 24,
            y: py - 16,
            w: 26,
            h: 16,
            kind: t >= 2 ? 'fame' : 'siren',
          });
        }
        if (i === 5) {
          caches.push({ x: px + 32, y: py - 20, w: 18, h: 18, taken: false, real: t === 4 });
        }
      }
      platforms.push({ x: 168, y: baseY + 40, w: 22, h: TIER_H - 80, climb: true });
      demons.push({
        x: 48 + t * 28,
        y: baseY + 210,
        w: 20,
        h: 20,
        vx: (0.55 + t * 0.22) * (t % 2 ? 1 : -1),
        freeze: 0,
      });
    }
    platforms.push({ x: 120, y: -5 * TIER_H + 90, w: 120, h: 16, zenith: true });
    S.platforms = platforms;
    S.hazards = hazards;
    S.caches = caches;
    S.demons = demons;
    S.hero = { x: 40, y: TIER_H - 60, w: 16, h: 22, vx: 0, vy: 0, onGround: false, invuln: 0 };
    S.camY = 0;
    S.tick = 0;
    S.revelation = null;
  }

  function currentTier() {
    return Math.min(5, Math.max(1, Math.floor((-S.hero.y + TIER_H) / TIER_H) + 1));
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  async function postTelemetry(payload) {
    var now = Date.now();
    if (now - S.lastPost < 350 && !payload.force) return null;
    S.lastPost = now;
    var data = await api('', { method: 'POST', body: payload });
    if (!data.ok) {
      setMsg(data.reason || 'Twin rejected telemetry.');
      return data;
    }
    S.player = data.player;
    S.bulletin = data.bulletin;
    S.leaderboard = data.leaderboard;
    renderMeta();
    if (data.grantedPlayerStatus) {
      setMsg('AI Twin granted Player Status — Goldilocks Goggles unlocked.');
    }
    if (data.revelation) {
      S.revelation = data.revelation;
      setMsg(data.revelation.message + ' Seal: ' + data.revelation.optimizeMs + ' ms.');
    }
    return data;
  }

  function step(dt) {
    var h = S.hero;
    var left = S.keys.ArrowLeft || S.keys.a || S.touchLeft;
    var right = S.keys.ArrowRight || S.keys.d || S.touchRight;
    var jump = S.keys[' '] || S.keys.ArrowUp || S.keys.w || S.touchJump;

    h.vx = left ? -2.2 : right ? 2.2 : 0;
    h.vy += 0.35 * dt;
    if (h.vy > 10) h.vy = 10;

    for (var i = 0; i < S.platforms.length; i++) {
      var p = S.platforms[i];
      if (p.climb && aabb(h, p) && (S.keys.ArrowUp || S.keys.w || S.touchJump)) h.vy = -2.4;
    }

    if (jump && h.onGround) {
      h.vy = -7.2;
      h.onGround = false;
    }

    h.x += h.vx * dt;
    h.y += h.vy * dt;
    if (h.x < 0) h.x = 0;
    if (h.x > 344) h.x = 344;

    h.onGround = false;
    for (var j = 0; j < S.platforms.length; j++) {
      var plat = S.platforms[j];
      if (plat.climb) continue;
      if (aabb(h, plat) && h.vy >= 0 && h.y + h.h - h.vy * dt <= plat.y + 4) {
        h.y = plat.y - h.h;
        h.vy = 0;
        h.onGround = true;
      }
    }

    for (var d = 0; d < S.demons.length; d++) {
      var dem = S.demons[d];
      if (dem.freeze > 0) dem.freeze -= dt;
      else {
        if (S.tick % Math.round(90 * PHI) < 8) dem.freeze = 12;
        dem.x += dem.vx * dt;
        if (dem.x < 8 || dem.x > 340) dem.vx *= -1;
      }
      if (h.invuln <= 0 && aabb(h, dem)) {
        h.invuln = 45;
        h.vy = -4;
        setMsg('Timing Demon phase-shift!');
        void postTelemetry({
          action: 'telemetry',
          tier: currentTier(),
          basePoints: 0,
          demonSurvived: true,
          graceDelta: 1,
        });
      }
    }

    for (var k = 0; k < S.hazards.length; k++) {
      var hz = S.hazards[k];
      if (h.invuln <= 0 && aabb(h, hz)) {
        h.invuln = 40;
        if (S.keys.g || S.keys.G) {
          setMsg('Grace resists the ' + hz.kind + ' trap.');
          void postTelemetry({
            action: 'telemetry',
            tier: currentTier(),
            basePoints: 2,
            trapResisted: true,
            graceDelta: 2,
          });
        } else {
          setMsg((hz.kind === 'fame' ? 'Fame & Glory' : 'Siren') + ' trap — press G for Grace.');
          h.vy = -3;
        }
      }
    }

    for (var c = 0; c < S.caches.length; c++) {
      var cache = S.caches[c];
      if (cache.taken || !aabb(h, cache)) continue;
      cache.taken = true;
      var isPlayer = S.player && S.player.status === 'player';
      if (cache.real && isPlayer && S.player.gogglesUnlocked) {
        setMsg('Verified Player: Goggles pointer recovered.');
        void postTelemetry({
          action: 'telemetry',
          tier: 5,
          basePoints: 12,
          graceDelta: 3,
          force: true,
        });
      } else if (cache.real) {
        setMsg('Cache feels empty — NPC blindness. Twin still hides the Goggles.');
        void postTelemetry({
          action: 'telemetry',
          tier: currentTier(),
          basePoints: 1,
          graceDelta: 1,
          force: true,
        });
      } else {
        setMsg("Fool's-gold cache — Treasure Trap walked past.");
        void postTelemetry({
          action: 'telemetry',
          tier: currentTier(),
          basePoints: 3,
          trapResisted: true,
          graceDelta: 1,
        });
      }
    }

    if (h.invuln > 0) h.invuln -= dt;

    var tier = currentTier();
    $('gq-tier').textContent = String(tier);
    $('gq-mult').textContent = String(TIERS[tier - 1].mult);
    S.camY += (h.y - 280 - S.camY) * 0.08;

    if (S.tick % 90 === 0) {
      void postTelemetry({ action: 'score', tier: tier, basePoints: 1 });
    }
    S.tick++;
  }

  function draw() {
    var canvas = $('gq-canvas');
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    ctx.fillStyle = '#050308';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(0, -S.camY);

    for (var t = 0; t < 5; t++) {
      var y0 = -t * TIER_H;
      ctx.fillStyle = TIERS[t].color;
      ctx.fillRect(0, y0, W, TIER_H);
      ctx.fillStyle = 'rgba(212,175,55,0.2)';
      ctx.font = '10px monospace';
      ctx.fillText('TIER ' + (t + 1) + ' · ×' + TIERS[t].mult + ' · ' + TIERS[t].name, 8, y0 + 16);
    }

    for (var i = 0; i < S.platforms.length; i++) {
      var p = S.platforms[i];
      ctx.fillStyle = p.climb ? 'rgba(94,234,212,0.35)' : p.zenith ? '#fbbf24' : '#8b5a2b';
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    for (var hi = 0; hi < S.hazards.length; hi++) {
      var hz = S.hazards[hi];
      ctx.fillStyle = hz.kind === 'fame' ? '#f472b6' : '#fb923c';
      ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
    }
    for (var ci = 0; ci < S.caches.length; ci++) {
      var cache = S.caches[ci];
      if (cache.taken) continue;
      var show = !cache.real || (S.player && S.player.gogglesUnlocked);
      if (!show) continue;
      ctx.fillStyle = cache.real ? '#5eead4' : '#a3a3a3';
      ctx.fillRect(cache.x, cache.y, cache.w, cache.h);
    }
    for (var di = 0; di < S.demons.length; di++) {
      var dem = S.demons[di];
      ctx.fillStyle = dem.freeze > 0 ? '#64748b' : '#ef4444';
      ctx.beginPath();
      ctx.arc(dem.x + 10, dem.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    var h = S.hero;
    ctx.fillStyle = h.invuln > 0 ? '#fde68a' : '#f5e6c8';
    ctx.fillRect(h.x, h.y, h.w, h.h);
    if (S.player && S.player.gogglesEquipped) {
      ctx.fillStyle = '#5eead4';
      ctx.fillRect(h.x + 2, h.y + 4, 12, 5);
    }
    if (S.revelation) {
      ctx.fillStyle = 'rgba(94,234,212,0.15)';
      ctx.fillRect(0, -5 * TIER_H, W, TIER_H);
      ctx.fillStyle = '#5eead4';
      ctx.font = '11px monospace';
      ctx.fillText('HOLOGRAPHIC GOLDILOCKS SUPER-AI', 36, -5 * TIER_H + 200);
      ctx.fillText('miracle · ' + S.revelation.optimizeMs + ' ms', 80, -5 * TIER_H + 220);
    }
    ctx.restore();
  }

  var last = 0;
  function loop(ts) {
    if (!S.running) return;
    var dt = Math.min(2, (ts - last) / 16.67 || 1);
    last = ts;
    step(dt);
    draw();
    requestAnimationFrame(loop);
  }

  async function enter(email) {
    S.email = normalizeEmail(email);
    var seat = await api('?email=' + encodeURIComponent(S.email));
    if (!seat.ok) {
      showGate(seat.reason || 'No seat for this email.');
      return;
    }
    remember(S.email);
    S.privilege = seat.privilege;
    var board = await api('');
    if (!board.ok) {
      showGate(board.reason || 'Twin door closed.');
      return;
    }
    S.player = board.player;
    S.bulletin = board.bulletin;
    S.leaderboard = board.leaderboard;
    $('gq-gate').hidden = true;
    $('gq-play').hidden = false;
    renderMeta();
    buildWorld();
    setMsg('Climb five tiers. Offer Grace (G). NPCs stay blind to the Goggles until the Twin grants Player Status.');
    S.running = true;
    last = performance.now();
    requestAnimationFrame(loop);
  }

  window.addEventListener('keydown', function (e) {
    S.keys[e.key] = true;
    if (e.key === 'g' || e.key === 'G') {
      void postTelemetry({
        action: 'telemetry',
        tier: currentTier(),
        basePoints: 1,
        unselfishOffer: true,
        graceDelta: 2,
        force: true,
      });
      setMsg('Unselfish grace offered.');
    }
    if ((e.key === 'e' || e.key === 'E') && S.player && S.player.gogglesUnlocked) {
      void postTelemetry({ action: 'equip-goggles', force: true });
    }
  });
  window.addEventListener('keyup', function (e) {
    S.keys[e.key] = false;
  });

  function bindTouch(id, flag) {
    var el = $(id);
    if (!el) return;
    var on = function (ev) {
      ev.preventDefault();
      S[flag] = true;
    };
    var off = function (ev) {
      ev.preventDefault();
      S[flag] = false;
    };
    el.addEventListener('touchstart', on, { passive: false });
    el.addEventListener('touchend', off);
    el.addEventListener('mousedown', on);
    el.addEventListener('mouseup', off);
    el.addEventListener('mouseleave', off);
  }
  bindTouch('gq-left', 'touchLeft');
  bindTouch('gq-right', 'touchRight');
  bindTouch('gq-jump', 'touchJump');
  $('gq-act').addEventListener('click', function () {
    void postTelemetry({
      action: 'telemetry',
      tier: currentTier(),
      basePoints: 1,
      unselfishOffer: true,
      graceDelta: 2,
      force: true,
    });
    setMsg('Grace offered.');
  });

  $('gq-gate-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    void enter($('gq-email').value);
  });
  $('gq-signout').addEventListener('click', function () {
    try {
      localStorage.removeItem(STORAGE);
    } catch (_) {}
    showGate();
  });
  $('gq-equip').addEventListener('click', function () {
    void postTelemetry({ action: 'equip-goggles', force: true });
  });
  $('gq-dispatch').addEventListener('click', function () {
    void postTelemetry({ action: 'daily-dispatch', force: true });
  });

  var shared = findSharedEmail();
  if (shared) $('gq-email').value = shared;
})();
