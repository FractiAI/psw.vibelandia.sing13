/** Prime Vault Chat · live guest client — ChatGPT-shaped · real Φ agent. */
(function () {
  var STORAGE_EMAIL = 'primevault.chat.email.v1';
  var STORAGE_THREAD = 'primevault.chat.thread.v1';
  var SHARED_EMAIL_KEYS = [
    'letschat.email.v1',
    'lattice.email',
    'lattice-chat.email',
    'primevault.race.email.v1',
  ];

  var WELCOME =
    'Greetings. I am the live Prime Vault Chat agent.\n\n' +
    'Ask me anything about Φ ≈ 1.618, prime vaults, the Omniversal Lattice, protein races, or how this differs from a trained LLM.\n\n' +
    'I answer with real closed-form vault resonance — $0 training · edge milliseconds · not a stub.';

  var state = {
    email: '',
    privilege: '',
    seat: '',
    busy: false,
    messages: [],
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

  function rememberSharedEmail(email) {
    try {
      localStorage.setItem(STORAGE_EMAIL, email);
      if (!localStorage.getItem('letschat.email.v1')) {
        localStorage.setItem('letschat.email.v1', email);
      }
    } catch (_) {}
  }

  function findSharedEmail() {
    try {
      var saved = localStorage.getItem(STORAGE_EMAIL);
      if (saved) return normalizeEmail(saved);
      for (var i = 0; i < SHARED_EMAIL_KEYS.length; i++) {
        var hit = localStorage.getItem(SHARED_EMAIL_KEYS[i]);
        if (hit) return normalizeEmail(hit);
      }
    } catch (_) {}
    return '';
  }

  function loadThread() {
    try {
      var raw = localStorage.getItem(STORAGE_THREAD);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (_) {}
    return null;
  }

  function saveThread() {
    try {
      localStorage.setItem(STORAGE_THREAD, JSON.stringify(state.messages.slice(-40)));
    } catch (_) {}
  }

  function showGate(err) {
    $('pvc-gate').hidden = false;
    $('pvc-chat').hidden = true;
    var box = $('pvc-gate-err');
    if (err) {
      box.hidden = false;
      box.textContent = err;
    } else {
      box.hidden = true;
      box.textContent = '';
    }
  }

  function showChat() {
    $('pvc-gate').hidden = true;
    $('pvc-chat').hidden = false;
    var seatNote =
      state.seat === 'walkon-demo'
        ? ' · walk-on guest'
        : state.privilege
          ? ' · ' + state.privilege
          : '';
    $('pvc-me-label').textContent = 'Seated as ' + state.email + seatNote;
    renderThread();
    $('pvc-input').focus();
  }

  function formatBody(content) {
    return escapeHtml(content)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderThread() {
    var root = $('pvc-thread');
    root.innerHTML = state.messages
      .map(function (m) {
        var metrics = '';
        if (m.role === 'assistant' && m.latencyMs != null) {
          metrics =
            '<p class="pvc-msg__metrics">Live agent · ' +
            (m.latencyMs < 1 ? m.latencyMs.toFixed(3) : m.latencyMs.toFixed(2)) +
            ' ms · $0 training · octave ' +
            (m.octaveTier || 7) +
            '</p>';
        }
        return (
          '<article class="pvc-msg pvc-msg--' +
          m.role +
          '">' +
          '<span class="pvc-msg__role">' +
          (m.role === 'user' ? 'You' : 'Prime Vault') +
          '</span>' +
          '<div class="pvc-msg__body"><p>' +
          formatBody(m.content) +
          '</p></div>' +
          metrics +
          '</article>'
        );
      })
      .join('');
    root.scrollTop = root.scrollHeight;
  }

  function resetMessages() {
    state.messages = [{ role: 'assistant', content: WELCOME, latencyMs: 0, octaveTier: 7 }];
    saveThread();
    renderThread();
  }

  async function checkSeat(email) {
    var res = await fetch(
      '/api/prime-vault-chat?email=' + encodeURIComponent(email),
      { headers: { Accept: 'application/json' } },
    );
    var data = await res.json().catch(function () {
      return { ok: false, reason: 'Seat check failed' };
    });
    return data;
  }

  async function sendMessage(text) {
    if (state.busy) return;
    state.busy = true;
    $('pvc-send').disabled = true;
    state.messages.push({ role: 'user', content: text });
    renderThread();
    saveThread();

    try {
      var res = await fetch('/api/prime-vault-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-lattice-email': state.email,
        },
        body: JSON.stringify({ message: text, octaveTier: 7 }),
      });
      var data = await res.json();
      if (!res.ok || !data.ok) {
        state.messages.push({
          role: 'assistant',
          content: data.reason || 'Lattice gate closed. Try a valid email seat.',
        });
      } else {
        state.messages.push({
          role: 'assistant',
          content: data.content || data.reply,
          latencyMs: data.latencyMs,
          octaveTier: data.octaveTier,
        });
        $('pvc-meta').textContent =
          'Live agent · Φ ≈ 1.618 · octave ' +
          (data.octaveTier || 7) +
          ' · last reply ' +
          (data.latencyMs < 1
            ? data.latencyMs.toFixed(3)
            : Number(data.latencyMs).toFixed(2)) +
          ' ms · $0 training';
      }
    } catch (e) {
      state.messages.push({
        role: 'assistant',
        content: 'Edge pipe hiccup. Try again in a moment.',
      });
    }

    saveThread();
    renderThread();
    state.busy = false;
    $('pvc-send').disabled = false;
    $('pvc-input').focus();
  }

  async function enter(email) {
    var data = await checkSeat(email);
    if (!data.ok) {
      showGate(data.reason || 'Enter a valid email to chat.');
      return;
    }
    state.email = data.email || email;
    state.privilege = data.privilege || '';
    state.seat = data.seat || '';
    rememberSharedEmail(state.email);
    var prior = loadThread();
    if (prior) state.messages = prior;
    else resetMessages();
    showChat();
  }

  function bind() {
    var pref = findSharedEmail();
    if (pref) $('pvc-email').value = pref;

    $('pvc-gate-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      enter(normalizeEmail($('pvc-email').value));
    });

    $('pvc-signout').addEventListener('click', function () {
      try {
        localStorage.removeItem(STORAGE_EMAIL);
      } catch (_) {}
      state.email = '';
      showGate();
    });

    $('pvc-new').addEventListener('click', function () {
      resetMessages();
    });

    $('pvc-composer').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = $('pvc-input');
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      sendMessage(text);
    });

    $('pvc-input').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        $('pvc-composer').requestSubmit();
      }
    });

    if (pref) enter(pref);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
