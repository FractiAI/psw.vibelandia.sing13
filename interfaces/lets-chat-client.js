/**
 * Let's Chat · edge client — fractal EGS encryption, ephemeral relay, local history only.
 */
(function () {
  var PHI_EGS = (1 + Math.sqrt(5)) / 2;
  var STORAGE_EMAIL = 'letschat.email.v1';
  var STORAGE_HISTORY = 'letschat.history.v1';
  var STORAGE_DND = 'letschat.dnd.v1';
  var POLL_MS = 4000;

  var state = {
    email: '',
    myPeerId: '',
    peers: [],
    activePeerId: null,
    presence: {},
    dnd: false,
    since: 0,
    pollTimer: null,
    presenceTimer: null,
    cryptoKey: null,
    threadKeys: {},
    seenIds: new Set(),
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

  function threadId(a, b) {
    return [a, b].sort().join(':');
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '{}');
    } catch {
      return {};
    }
  }

  function saveHistory(map) {
    try {
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(map));
    } catch (_) {}
  }

  function appendLocalMessage(tid, msg) {
    var map = loadHistory();
    if (!map[tid]) map[tid] = [];
    if (map[tid].some(function (m) { return m.id === msg.id; })) return;
    map[tid].push(msg);
    if (map[tid].length > 200) map[tid] = map[tid].slice(-200);
    saveHistory(map);
  }

  function getLocalMessages(tid) {
    var map = loadHistory();
    return map[tid] || [];
  }

  async function sha256Bytes(text) {
    var enc = new TextEncoder().encode(text);
    var buf = await crypto.subtle.digest('SHA-256', enc);
    return new Uint8Array(buf);
  }

  async function getThreadKey(peerA, peerB) {
    var tid = threadId(peerA, peerB);
    if (state.threadKeys[tid]) return state.threadKeys[tid];
    var material = PHI_EGS + '|lets-chat|v1|' + tid;
    var raw = await sha256Bytes(material);
    var key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, [
      'encrypt',
      'decrypt',
    ]);
    state.threadKeys[tid] = key;
    return key;
  }

  async function encryptText(peerA, peerB, plain) {
    var key = await getThreadKey(peerA, peerB);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var enc = new TextEncoder().encode(plain);
    var cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc);
    var combined = new Uint8Array(iv.length + cipher.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipher), iv.length);
    return btoa(String.fromCharCode.apply(null, combined))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async function decryptText(peerA, peerB, b64url) {
    try {
      var b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var binary = atob(b64);
      var combined = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i);
      var iv = combined.slice(0, 12);
      var data = combined.slice(12);
      var key = await getThreadKey(peerA, peerB);
      var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
      return new TextDecoder().decode(plain);
    } catch {
      return '[encrypted]';
    }
  }

  function apiHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-lattice-email': state.email,
    };
  }

  async function apiGet(path) {
    var res = await fetch('/api/lets-chat' + path, { headers: apiHeaders() });
    return res.json();
  }

  async function apiPost(path, body) {
    var res = await fetch('/api/lets-chat' + path, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  }

  function renderPeers() {
    var list = $('lc-peer-list');
    list.innerHTML = '';
    state.peers.forEach(function (p) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lc-peer-btn';
      btn.textContent = p.name;
      btn.dataset.peerId = p.id;
      if (state.presence[p.id] && state.presence[p.id].dnd) btn.dataset.dnd = 'true';
      if (p.id === state.activePeerId) btn.setAttribute('aria-current', 'true');
      btn.addEventListener('click', function () {
        openThread(p.id);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function renderMessages(tid) {
    var ol = $('lc-messages');
    ol.innerHTML = '';
    var msgs = getLocalMessages(tid);
    msgs.forEach(function (m) {
      var li = document.createElement('li');
      li.className = 'lc-msg ' + (m.mine ? 'lc-msg--mine' : 'lc-msg--theirs');
      var meta = document.createElement('span');
      meta.className = 'lc-msg__meta';
      meta.textContent = m.mine ? 'You' : m.fromName || 'Guest';
      var body = document.createElement('span');
      body.textContent = m.text;
      li.appendChild(meta);
      li.appendChild(body);
      ol.appendChild(li);
    });
    ol.scrollTop = ol.scrollHeight;
  }

  function openThread(peerId) {
    state.activePeerId = peerId;
    var peer = state.peers.find(function (p) { return p.id === peerId; });
    $('lc-thread-empty').hidden = true;
    $('lc-thread-head').hidden = false;
    $('lc-compose').hidden = false;
    $('lc-thread-name').textContent = peer ? peer.name : 'Guest';
    var pres = state.presence[peerId];
    $('lc-thread-status').textContent = pres && pres.dnd ? 'Do not disturb' : 'Goldilocks · consent-first';
    renderPeers();
    renderMessages(threadId(state.myPeerId, peerId));
  }

  async function refreshRoster() {
    var data = await apiGet('?roster=1');
    if (!data.ok) throw new Error(data.message || 'roster_failed');
    state.myPeerId = data.myPeerId;
    state.peers = data.peers || [];
    $('lc-me-label').textContent = state.email;
    renderPeers();
  }

  async function pushPresence() {
    await apiPost('?presence=1', { dnd: state.dnd, label: state.dnd ? 'dnd' : 'online' });
  }

  async function pullPresence() {
    var data = await apiGet('?presence=1');
    if (data.ok && data.presence) {
      state.presence = data.presence;
      renderPeers();
      if (state.activePeerId) {
        var pres = state.presence[state.activePeerId];
        $('lc-thread-status').textContent = pres && pres.dnd ? 'Do not disturb' : 'Goldilocks · consent-first';
      }
    }
  }

  async function pollInbox() {
    var data = await apiGet('?inbox=1&since=' + state.since);
    if (!data.ok || !Array.isArray(data.envelopes)) return;
    for (var i = 0; i < data.envelopes.length; i++) {
      var env = data.envelopes[i];
      if (state.seenIds.has(env.id)) continue;
      state.seenIds.add(env.id);
      state.since = Math.max(state.since, env.at || 0);
      var plain = await decryptText(state.myPeerId, env.fromPeerId, env.ciphertext);
      var peer = state.peers.find(function (p) { return p.id === env.fromPeerId; });
      var msg = {
        id: env.id,
        text: plain,
        mine: false,
        fromName: peer ? peer.name : 'Guest',
        at: env.at,
      };
      appendLocalMessage(env.threadId, msg);
      if (
        state.activePeerId &&
        env.threadId === threadId(state.myPeerId, state.activePeerId)
      ) {
        renderMessages(env.threadId);
      }
    }
  }

  async function sendMessage(text) {
    if (!state.activePeerId || !text.trim()) return;
    var tid = threadId(state.myPeerId, state.activePeerId);
    var target = state.presence[state.activePeerId];
    if (target && target.dnd) {
      alert('This guest has Do Not Disturb on. Fair Exchange — try again later.');
      return;
    }
    var id = 'lc_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now());
    var cipher = await encryptText(state.myPeerId, state.activePeerId, text.trim());
    var result = await apiPost('?inbox=1', {
      id: id,
      kind: 'msg',
      toPeerId: state.activePeerId,
      threadId: tid,
      ciphertext: cipher,
    });
    if (!result.ok) {
      alert('Could not send — relay unavailable.');
      return;
    }
    appendLocalMessage(tid, {
      id: id,
      text: text.trim(),
      mine: true,
      fromName: 'You',
      at: Date.now(),
    });
    renderMessages(tid);
    $('lc-input').value = '';
  }

  function startLoops() {
    stopLoops();
    state.pollTimer = window.setInterval(function () {
      void pollInbox();
    }, POLL_MS);
    state.presenceTimer = window.setInterval(function () {
      void pushPresence();
      void pullPresence();
    }, 15000);
    void pushPresence();
    void pullPresence();
    void pollInbox();
  }

  function stopLoops() {
    if (state.pollTimer) window.clearInterval(state.pollTimer);
    if (state.presenceTimer) window.clearInterval(state.presenceTimer);
    state.pollTimer = null;
    state.presenceTimer = null;
  }

  function showRoom() {
    $('lc-gate').hidden = true;
    $('lc-room').hidden = false;
  }

  function showGate(err) {
    stopLoops();
    $('lc-gate').hidden = false;
    $('lc-room').hidden = true;
    var errEl = $('lc-gate-err');
    if (err) {
      errEl.textContent = err;
      errEl.hidden = false;
    } else {
      errEl.hidden = true;
    }
  }

  async function signIn(email) {
    state.email = normalizeEmail(email);
    try {
      await refreshRoster();
      localStorage.setItem(STORAGE_EMAIL, state.email);
      state.dnd = localStorage.getItem(STORAGE_DND) === '1';
      updateDndButton();
      showRoom();
      startLoops();
    } catch (e) {
      showGate(e.message || 'Access denied. Email the Purser for a seat.');
    }
  }

  function updateDndButton() {
    var btn = $('lc-dnd-btn');
    btn.setAttribute('aria-pressed', state.dnd ? 'true' : 'false');
    btn.textContent = state.dnd ? 'Do not disturb · on' : 'Do not disturb · off';
  }

  $('lc-gate-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    void signIn($('lc-email').value);
  });

  $('lc-signout').addEventListener('click', function () {
    localStorage.removeItem(STORAGE_EMAIL);
    state.email = '';
    state.myPeerId = '';
    state.activePeerId = null;
    showGate();
  });

  $('lc-dnd-btn').addEventListener('click', function () {
    state.dnd = !state.dnd;
    localStorage.setItem(STORAGE_DND, state.dnd ? '1' : '0');
    updateDndButton();
    void pushPresence();
  });

  $('lc-compose').addEventListener('submit', function (ev) {
    ev.preventDefault();
    void sendMessage($('lc-input').value);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && state.email) {
      void pollInbox();
      void pullPresence();
    }
  });

  var saved = localStorage.getItem(STORAGE_EMAIL);
  if (saved) {
    $('lc-email').value = saved;
    void signIn(saved);
  }
})();
