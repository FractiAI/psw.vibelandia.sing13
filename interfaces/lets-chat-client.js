/**
 * Let's Chat · edge client — fractal EGS encryption, WebRTC voice/video, file upload.
 */
(function () {
  var PHI_EGS = (1 + Math.sqrt(5)) / 2;
  var STORAGE_EMAIL = 'letschat.email.v1';
  var STORAGE_HISTORY = 'letschat.history.v1';
  var STORAGE_DND = 'letschat.dnd.v1';
  var STORAGE_UNREAD = 'letschat.unread.v1';
  var BC_UNREAD = 'letschat-unread-v1';
  var POLL_MS = 3000;
  var MAX_FILE_BYTES = 256 * 1024;
  var ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

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
    threadKeys: {},
    seenIds: new Set(),
  };

  var rtc = {
    pc: null,
    localStream: null,
    callMode: null,
    pendingIce: [],
    inCall: false,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function normalizeEmail(raw) {
    return String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
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
    if (map[tid].length > 120) map[tid] = map[tid].slice(-120);
    saveHistory(map);
  }

  function getLocalMessages(tid) {
    return loadHistory()[tid] || [];
  }

  // --- Unread tracking ---

  function loadUnread() {
    try { return JSON.parse(localStorage.getItem(STORAGE_UNREAD) || '{}'); } catch { return {}; }
  }

  function saveUnread(map) {
    try { localStorage.setItem(STORAGE_UNREAD, JSON.stringify(map)); } catch (_) {}
    broadcastUnread(map);
  }

  function broadcastUnread(map) {
    var total = Object.values(map).reduce(function (s, n) { return s + (n || 0); }, 0);
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel(BC_UNREAD).postMessage({ total: total, counts: map });
      }
    } catch (_) {}
  }

  function totalUnread() {
    return Object.values(loadUnread()).reduce(function (s, n) { return s + (n || 0); }, 0);
  }

  function markUnread(peerId) {
    var map = loadUnread();
    map[peerId] = (map[peerId] || 0) + 1;
    saveUnread(map);
  }

  function clearUnread(peerId) {
    var map = loadUnread();
    if (!map[peerId]) return;
    delete map[peerId];
    saveUnread(map);
  }

  function updatePageTitle() {
    var n = totalUnread();
    var base = 'Let\'s Chat · SS Vibelandia';
    document.title = n > 0 ? '(' + n + ') ' + base : base;
  }

  // --- End unread tracking ---

  async function sha256Bytes(text) {
    var enc = new TextEncoder().encode(text);
    return new Uint8Array(await crypto.subtle.digest('SHA-256', enc));
  }

  async function getThreadKey(peerA, peerB) {
    var tid = threadId(peerA, peerB);
    if (state.threadKeys[tid]) return state.threadKeys[tid];
    var material = PHI_EGS + '|lets-chat|v1|' + tid;
    var key = await crypto.subtle.importKey(
      'raw',
      await sha256Bytes(material),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );
    state.threadKeys[tid] = key;
    return key;
  }

  function b64UrlFromBytes(bytes) {
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function bytesFromB64Url(b64url) {
    var b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var binary = atob(b64);
    var out = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  }

  async function encryptPayload(peerA, peerB, plain) {
    var key = await getThreadKey(peerA, peerB);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(plain));
    var combined = new Uint8Array(iv.length + cipher.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipher), iv.length);
    return b64UrlFromBytes(combined);
  }

  async function decryptPayload(peerA, peerB, b64url) {
    try {
      var combined = bytesFromB64Url(b64url);
      var plain = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: combined.slice(0, 12) },
        await getThreadKey(peerA, peerB),
        combined.slice(12),
      );
      return new TextDecoder().decode(plain);
    } catch {
      return null;
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
    return (await fetch('/api/lets-chat' + path, { headers: apiHeaders() })).json();
  }

  async function apiPost(path, body) {
    return (await fetch('/api/lets-chat' + path, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify(body),
    })).json();
  }

  function peerBlocked() {
    var pres = state.activePeerId && state.presence[state.activePeerId];
    return pres && pres.dnd;
  }

  async function sendEnvelope(opts) {
    return apiPost('?inbox=1', {
      id: opts.id,
      kind: opts.kind || 'msg',
      toPeerId: opts.toPeerId,
      threadId: opts.threadId,
      ciphertext: opts.ciphertext,
    });
  }

  function newId(prefix) {
    return prefix + '_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now());
  }

  function peerInitials(name) {
    var parts = String(name || '?').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return String(name || '?').slice(0, 2).toUpperCase();
  }

  function formatTime(at) {
    if (!at) return '';
    var d = new Date(typeof at === 'number' ? at : Date.parse(at));
    if (Number.isNaN(d.getTime())) return '';
    var now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  function lastMessagePreview(peerId) {
    var tid = threadId(state.myPeerId, peerId);
    var msgs = getLocalMessages(tid);
    if (!msgs.length) return 'Tap to start encrypted chat';
    var last = msgs[msgs.length - 1];
    if (last.msgType === 'photo') return '📷 Photo';
    if (last.msgType === 'file') return '📎 ' + (last.fileName || 'File');
    var t = String(last.text || '').trim();
    return (last.mine ? 'You: ' : '') + (t.length > 48 ? t.slice(0, 48) + '…' : t);
  }

  function setThreadShell(inThread) {
    var shell = $('lc-shell');
    if (inThread) shell.classList.add('lc-shell--in-thread');
    else shell.classList.remove('lc-shell--in-thread');
  }

  function renderPeers() {
    var list = $('lc-peer-list');
    var empty = $('lc-list-empty');
    list.innerHTML = '';
    if (!state.peers.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    state.peers.forEach(function (p) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lc-chat-row';
      btn.dataset.peerId = p.id;
      if (p.id === state.activePeerId) btn.setAttribute('aria-current', 'true');

      var avatar = document.createElement('span');
      avatar.className = 'lc-avatar lc-avatar--sm';
      avatar.textContent = peerInitials(p.name);

      var body = document.createElement('div');
      body.className = 'lc-chat-row__body';

      var top = document.createElement('div');
      top.className = 'lc-chat-row__top';
      var name = document.createElement('span');
      name.className = 'lc-chat-row__name';
      name.textContent = p.name;
      var tid = threadId(state.myPeerId, p.id);
      var msgs = getLocalMessages(tid);
      var lastAt = msgs.length ? msgs[msgs.length - 1].at : null;
      var time = document.createElement('span');
      time.className = 'lc-chat-row__time';
      time.textContent = formatTime(lastAt);
      top.appendChild(name);
      top.appendChild(time);

      var preview = document.createElement('p');
      preview.className = 'lc-chat-row__preview';
      if (state.presence[p.id] && state.presence[p.id].dnd) {
        preview.classList.add('lc-chat-row__preview--dnd');
      }
      preview.textContent = lastMessagePreview(p.id);

      var unreadCount = (loadUnread()[p.id] || 0);
      if (unreadCount > 0) {
        var badge = document.createElement('span');
        badge.className = 'lc-unread-badge';
        badge.setAttribute('aria-label', unreadCount + ' unread');
        badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
        top.appendChild(badge);
      }

      body.appendChild(top);
      body.appendChild(preview);
      btn.appendChild(avatar);
      btn.appendChild(body);
      btn.addEventListener('click', function () { openThread(p.id); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  function renderMessages(tid) {
    var ol = $('lc-messages');
    ol.innerHTML = '';
    getLocalMessages(tid).forEach(function (m) {
      var li = document.createElement('li');
      li.className = 'lc-msg ' + (m.mine ? 'lc-msg--mine' : 'lc-msg--theirs');
      if (m.msgType === 'photo' && m.dataUrl) {
        var img = document.createElement('img');
        img.className = 'lc-msg__img';
        img.src = m.dataUrl;
        img.alt = m.fileName || 'Photo';
        li.appendChild(img);
      } else if (m.msgType === 'file' && m.dataUrl) {
        var a = document.createElement('a');
        a.className = 'lc-msg__file';
        a.href = m.dataUrl;
        a.download = m.fileName || 'file';
        a.textContent = '📎 ' + (m.fileName || 'Download file');
        li.appendChild(a);
      } else {
        var text = document.createElement('span');
        text.className = 'lc-msg__text';
        text.textContent = m.text || '';
        li.appendChild(text);
      }
      var time = document.createElement('span');
      time.className = 'lc-msg__time';
      time.textContent = formatTime(m.at);
      li.appendChild(time);
      ol.appendChild(li);
    });
    ol.scrollTop = ol.scrollHeight;
  }

  function updateCallUi() {
    $('lc-hangup-btn').hidden = !rtc.inCall;
    $('lc-voice-btn').disabled = rtc.inCall;
    $('lc-video-btn').disabled = rtc.inCall;
  }

  function showCallPanel(mode, label) {
    $('lc-call-panel').hidden = false;
    $('lc-call-label').textContent = label || (mode === 'video' ? 'Video call' : 'Voice call');
    $('lc-local-video').hidden = mode !== 'video';
    updateCallUi();
  }

  function hideCallPanel() {
    $('lc-call-panel').hidden = true;
    $('lc-remote-video').srcObject = null;
    $('lc-local-video').srcObject = null;
    updateCallUi();
  }

  function endCall(notify) {
    if (notify && state.activePeerId) {
      void sendSignal({ type: 'hangup' });
    }
    if (rtc.localStream) {
      rtc.localStream.getTracks().forEach(function (t) { t.stop(); });
    }
    if (rtc.pc) rtc.pc.close();
    rtc.pc = null;
    rtc.localStream = null;
    rtc.callMode = null;
    rtc.pendingIce = [];
    rtc.inCall = false;
    hideCallPanel();
  }

  async function sendSignal(payload) {
    if (!state.activePeerId) return;
    var tid = threadId(state.myPeerId, state.activePeerId);
    var cipher = await encryptPayload(state.myPeerId, state.activePeerId, JSON.stringify(payload));
    await sendEnvelope({
      id: newId('sig'),
      kind: 'signal',
      toPeerId: state.activePeerId,
      threadId: tid,
      ciphertext: cipher,
    });
  }

  async function flushPendingIce() {
    if (!rtc.pc || !rtc.pc.remoteDescription) return;
    while (rtc.pendingIce.length) {
      var c = rtc.pendingIce.shift();
      try {
        await rtc.pc.addIceCandidate(c);
      } catch (_) {}
    }
  }

  function attachPcHandlers() {
    rtc.pc.ontrack = function (ev) {
      var stream = ev.streams[0];
      $('lc-remote-video').srcObject = stream;
      if (rtc.callMode === 'voice') {
        var v = $('lc-remote-video');
        v.style.display = 'none';
        $('lc-call-label').textContent = 'Voice call · connected';
      }
    };
    rtc.pc.onicecandidate = function (ev) {
      if (ev.candidate) void sendSignal({ type: 'ice', candidate: ev.candidate.toJSON() });
    };
    rtc.pc.onconnectionstatechange = function () {
      if (rtc.pc && (rtc.pc.connectionState === 'failed' || rtc.pc.connectionState === 'disconnected')) {
        $('lc-call-label').textContent = 'Call ended · ' + rtc.pc.connectionState;
        window.setTimeout(function () { endCall(false); }, 1500);
      }
    };
  }

  async function ensurePc() {
    if (rtc.pc) return rtc.pc;
    rtc.pc = new RTCPeerConnection(ICE);
    attachPcHandlers();
    return rtc.pc;
  }

  async function startCall(video) {
    if (!state.activePeerId) return;
    if (peerBlocked()) {
      alert('This guest has Do Not Disturb on. Fair Exchange — try again later.');
      return;
    }
    if (!navigator.mediaDevices || !window.RTCPeerConnection) {
      alert('Voice and video require a modern browser with camera/microphone access.');
      return;
    }
    try {
      rtc.callMode = video ? 'video' : 'voice';
      rtc.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: video });
      await ensurePc();
      rtc.localStream.getTracks().forEach(function (t) {
        rtc.pc.addTrack(t, rtc.localStream);
      });
      $('lc-local-video').srcObject = rtc.localStream;
      showCallPanel(rtc.callMode, video ? 'Calling… video' : 'Calling… voice');
      rtc.inCall = true;
      var offer = await rtc.pc.createOffer();
      await rtc.pc.setLocalDescription(offer);
      await sendSignal({ type: 'offer', sdp: rtc.pc.localDescription.toJSON(), callMode: rtc.callMode });
    } catch (err) {
      endCall(false);
      alert('Could not start call: ' + (err.message || 'permission denied'));
    }
  }

  async function handleSignal(payload, fromPeerId) {
    if (!payload || !payload.type) return;
    if (payload.type === 'hangup') {
      endCall(false);
      return;
    }
    if (payload.type === 'offer') {
      if (state.dnd) {
        await sendSignal({ type: 'hangup' });
        return;
      }
      var peer = state.peers.find(function (p) { return p.id === fromPeerId; });
      var mode = payload.callMode === 'video' ? 'video' : 'voice';
      if (!window.confirm('Incoming ' + mode + ' call from ' + (peer ? peer.name : 'guest') + '. Accept?')) {
        await sendSignal({ type: 'hangup' });
        return;
      }
      try {
        endCall(false);
        rtc.callMode = mode;
        rtc.inCall = true;
        rtc.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === 'video' });
        await ensurePc();
        rtc.localStream.getTracks().forEach(function (t) {
          rtc.pc.addTrack(t, rtc.localStream);
        });
        $('lc-local-video').srcObject = rtc.localStream;
        showCallPanel(mode, 'Incoming ' + mode + ' call');
        await rtc.pc.setRemoteDescription(payload.sdp);
        await flushPendingIce();
        var answer = await rtc.pc.createAnswer();
        await rtc.pc.setLocalDescription(answer);
        await sendSignal({ type: 'answer', sdp: rtc.pc.localDescription.toJSON() });
      } catch (err) {
        endCall(false);
        alert('Could not answer call: ' + (err.message || 'error'));
      }
      return;
    }
    if (payload.type === 'answer' && rtc.pc) {
      await rtc.pc.setRemoteDescription(payload.sdp);
      await flushPendingIce();
      $('lc-call-label').textContent = (rtc.callMode === 'video' ? 'Video' : 'Voice') + ' call · connected';
      return;
    }
    if (payload.type === 'ice' && payload.candidate) {
      if (rtc.pc && rtc.pc.remoteDescription) {
        try {
          await rtc.pc.addIceCandidate(payload.candidate);
        } catch (_) {
          rtc.pendingIce.push(payload.candidate);
        }
      } else {
        rtc.pendingIce.push(payload.candidate);
      }
    }
  }

  async function ingestEnvelope(env) {
    if (state.seenIds.has(env.id)) return;
    state.seenIds.add(env.id);
    state.since = Math.max(state.since, env.at || 0);

    if (env.kind === 'signal') {
      var sigPlain = await decryptPayload(state.myPeerId, env.fromPeerId, env.ciphertext);
      if (sigPlain) {
        try {
          await handleSignal(JSON.parse(sigPlain), env.fromPeerId);
        } catch (_) {}
      }
      return;
    }

    var plain = await decryptPayload(state.myPeerId, env.fromPeerId, env.ciphertext);
    if (!plain) return;
    var peer = state.peers.find(function (p) { return p.id === env.fromPeerId; });
    var msg;

    if (env.kind === 'photo' || env.kind === 'file') {
      try {
        var parsed = JSON.parse(plain);
        var mime = parsed.mime || 'application/octet-stream';
        msg = {
          id: env.id,
          msgType: env.kind,
          fileName: parsed.name || 'file',
          dataUrl: 'data:' + mime + ';base64,' + parsed.data,
          mine: false,
          fromName: peer ? peer.name : 'Guest',
          at: env.at,
        };
      } catch {
        return;
      }
    } else {
      msg = {
        id: env.id,
        msgType: 'text',
        text: plain,
        mine: false,
        fromName: peer ? peer.name : 'Guest',
        at: env.at,
      };
    }

    appendLocalMessage(env.threadId, msg);

    var isActiveThread = state.activePeerId && env.threadId === threadId(state.myPeerId, state.activePeerId);
    if (!isActiveThread) {
      markUnread(env.fromPeerId);
      updatePageTitle();
    }

    renderPeers();
    if (isActiveThread) {
      renderMessages(env.threadId);
    }
  }

  function closeThread() {
    endCall(false);
    state.activePeerId = null;
    setThreadShell(false);
    $('lc-thread-active').hidden = true;
    $('lc-thread-empty').hidden = false;
    renderPeers();
  }

  function openThread(peerId) {
    endCall(false);
    state.activePeerId = peerId;
    clearUnread(peerId);
    updatePageTitle();
    var peer = state.peers.find(function (p) { return p.id === peerId; });
    var name = peer ? peer.name : 'Guest';
    $('lc-thread-empty').hidden = true;
    $('lc-thread-active').hidden = false;
    $('lc-thread-name').textContent = name;
    $('lc-thread-avatar').textContent = peerInitials(name);
    var pres = state.presence[peerId];
    $('lc-thread-status').textContent = pres && pres.dnd ? 'Do not disturb' : 'online · encrypted';
    setThreadShell(true);
    renderPeers();
    renderMessages(threadId(state.myPeerId, peerId));
    updateCallUi();
    $('lc-input').focus();
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
        $('lc-thread-status').textContent = pres && pres.dnd ? 'Do not disturb' : 'online · encrypted';
      }
    }
  }

  async function pollInbox() {
    var data = await apiGet('?inbox=1&since=' + state.since);
    if (!data.ok || !Array.isArray(data.envelopes)) return;
    for (var i = 0; i < data.envelopes.length; i++) {
      await ingestEnvelope(data.envelopes[i]);
    }
  }

  async function sendMessage(text) {
    if (!state.activePeerId || !text.trim()) return;
    if (peerBlocked()) {
      alert('This guest has Do Not Disturb on. Fair Exchange — try again later.');
      return;
    }
    var tid = threadId(state.myPeerId, state.activePeerId);
    var id = newId('lc');
    var cipher = await encryptPayload(state.myPeerId, state.activePeerId, text.trim());
    var result = await sendEnvelope({ id: id, kind: 'msg', toPeerId: state.activePeerId, threadId: tid, ciphertext: cipher });
    if (!result.ok) {
      alert('Could not send — relay unavailable.');
      return;
    }
    appendLocalMessage(tid, { id: id, msgType: 'text', text: text.trim(), mine: true, fromName: 'You', at: Date.now() });
    renderMessages(tid);
    renderPeers();
    $('lc-input').value = '';
  }

  function arrayBufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  async function sendFile(file) {
    if (!state.activePeerId || !file) return;
    if (peerBlocked()) {
      alert('This guest has Do Not Disturb on. Fair Exchange — try again later.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      alert('Max file size is 256 KB on this relay. Fair Exchange — try a smaller file.');
      return;
    }
    var isPhoto = (file.type || '').indexOf('image/') === 0;
    var kind = isPhoto ? 'photo' : 'file';
    var tid = threadId(state.myPeerId, state.activePeerId);
    var id = newId('lc');
    var payload = JSON.stringify({
      name: file.name || (isPhoto ? 'photo.jpg' : 'file'),
      mime: file.type || 'application/octet-stream',
      data: arrayBufferToBase64(await file.arrayBuffer()),
    });
    var cipher = await encryptPayload(state.myPeerId, state.activePeerId, payload);
    var result = await sendEnvelope({ id: id, kind: kind, toPeerId: state.activePeerId, threadId: tid, ciphertext: cipher });
    if (!result.ok) {
      alert('Could not upload — relay unavailable or file too large.');
      return;
    }
    var dataUrl = 'data:' + (file.type || 'application/octet-stream') + ';base64,' + JSON.parse(payload).data;
    appendLocalMessage(tid, {
      id: id,
      msgType: kind,
      fileName: file.name,
      dataUrl: dataUrl,
      mine: true,
      fromName: 'You',
      at: Date.now(),
    });
    renderMessages(tid);
    renderPeers();
  }

  function startLoops() {
    stopLoops();
    state.pollTimer = window.setInterval(function () { void pollInbox(); }, POLL_MS);
    state.presenceTimer = window.setInterval(function () {
      void pushPresence();
      void pullPresence();
    }, 12000);
    void pushPresence();
    void pullPresence();
    void pollInbox();
  }

  function stopLoops() {
    if (state.pollTimer) window.clearInterval(state.pollTimer);
    if (state.presenceTimer) window.clearInterval(state.presenceTimer);
    state.pollTimer = null;
    state.presenceTimer = null;
    endCall(false);
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
    var buttons = [$('lc-dnd-btn'), $('lc-dnd-btn-thread')];
    var label = state.dnd ? 'Do not disturb · on · tap to go available' : 'Do not disturb · off · tap to quiet';
    var title = state.dnd ? 'Do not disturb · on' : 'Do not disturb · off';
    var icon = state.dnd ? '🔕' : '🔔';
    var text = state.dnd ? 'Quiet' : 'Available';
    var textCompact = state.dnd ? 'Quiet' : 'Avail';
    buttons.forEach(function (btn) {
      if (!btn) return;
      btn.setAttribute('aria-pressed', state.dnd ? 'true' : 'false');
      btn.setAttribute('aria-label', label);
      btn.title = title;
      var iconEl = btn.querySelector('.lc-dnd-toggle__icon');
      var textEl = btn.querySelector('.lc-dnd-toggle__text');
      if (iconEl) iconEl.textContent = icon;
      if (textEl) {
        textEl.textContent = btn.id === 'lc-dnd-btn-thread' ? textCompact : text;
      }
    });
    var status = $('lc-dnd-status');
    if (status) {
      status.hidden = !state.dnd;
      status.textContent = state.dnd ? 'Do not disturb is on — tap Quiet to turn off' : '';
    }
  }

  function toggleDnd() {
    state.dnd = !state.dnd;
    if (state.dnd) localStorage.setItem(STORAGE_DND, '1');
    else localStorage.removeItem(STORAGE_DND);
    updateDndButton();
    void pushPresence();
    if (state.dnd) endCall(true);
  }

  $('lc-back-btn').addEventListener('click', closeThread);

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

  $('lc-dnd-btn').addEventListener('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    toggleDnd();
  });
  $('lc-dnd-btn-thread').addEventListener('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    toggleDnd();
  });

  $('lc-compose').addEventListener('submit', function (ev) {
    ev.preventDefault();
    void sendMessage($('lc-input').value);
  });

  $('lc-voice-btn').addEventListener('click', function () { void startCall(false); });
  $('lc-video-btn').addEventListener('click', function () { void startCall(true); });
  $('lc-hangup-btn').addEventListener('click', function () { endCall(true); });

  $('lc-file-input').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (file) void sendFile(file);
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
