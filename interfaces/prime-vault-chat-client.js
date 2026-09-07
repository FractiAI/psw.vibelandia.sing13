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
    "Hey — I'm the live Prime Vault Chat agent — a domain-bounded closed-form language processor with operational LUDCR.\n\n" +
    "Listen → understand (catalog) → decide → respond (fold) → communicate on this door. Knowledge is a recursive protein library (encode ≠ LLM training). $0 — no Claude/GPT mouth.\n\n" +
    "Ask who I am, Φ ≈ 1.618, the voyage grand arc (Borikén · Reno), Goldilocks / magnetic catalog, or the Race scoreboard.";

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

  function setChatOpen(open) {
    document.body.classList.toggle('pvc-chat-open', !!open);
    var host = document.querySelector('[data-qv-page-visits-host]');
    if (host) {
      if (open) {
        host.style.setProperty(
          'bottom',
          'calc(5.75rem + env(safe-area-inset-bottom, 0px) + var(--pvc-keyboard-inset, 0px))',
          'important',
        );
      } else {
        host.style.removeProperty('bottom');
      }
    }
  }

  function showGate(err) {
    $('pvc-gate').hidden = false;
    $('pvc-chat').hidden = true;
    setChatOpen(false);
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
    setChatOpen(true);
    var seatNote =
      state.seat === 'walkon-demo'
        ? ' · walk-on guest'
        : state.privilege
          ? ' · ' + state.privilege
          : '';
    $('pvc-me-label').textContent = 'Seated as ' + state.email + seatNote;
    renderThread();
    var input = $('pvc-input');
    if (input) {
      try {
        input.focus({ preventScroll: false });
      } catch (_) {
        input.focus();
      }
      window.setTimeout(function () {
        var composer = $('pvc-composer');
        if (composer && composer.scrollIntoView) {
          composer.scrollIntoView({ block: 'end', behavior: 'smooth' });
        }
      }, 50);
    }
  }

  function formatBody(content) {
    return escapeHtml(content)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/_([^_\n]+)_/g, '<em>$1</em>')
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
      var history = state.messages
        .filter(function (m) {
          return m.role === 'user' || m.role === 'assistant';
        })
        .slice(0, -1)
        .slice(-12)
        .map(function (m) {
          return { role: m.role, content: String(m.content || '').slice(0, 2000) };
        });

      var res = await fetch('/api/prime-vault-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-lattice-email': state.email,
        },
        body: JSON.stringify({ message: text, octaveTier: 7, history: history }),
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
          speechAct: data.speechAct,
        });
        $('pvc-meta').textContent =
          'Live LLM-sim · Φ ≈ 1.618 · octave ' +
          (data.octaveTier || 7) +
          ' · last reply ' +
          (data.latencyMs < 1
            ? data.latencyMs.toFixed(3)
            : Number(data.latencyMs).toFixed(2)) +
          ' ms · $0 training · thread ' +
          (data.historyTurns != null ? data.historyTurns : history.length);
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
      if (!text || state.busy) return;
      input.value = '';
      void sendMessage(text);
    });

    // Explicit tap path — some mobile browsers miss submit when chrome overlays the form.
    var sendBtn = $('pvc-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var input = $('pvc-input');
        var text = input && input.value.trim();
        if (!text || state.busy) return;
        input.value = '';
        void sendMessage(text);
      });
    }

    $('pvc-input').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && !ev.shiftKey) {
        ev.preventDefault();
        var input = $('pvc-input');
        var text = input.value.trim();
        if (!text || state.busy) return;
        input.value = '';
        void sendMessage(text);
      }
    });

    // visualViewport: lift dock when iOS keyboard opens
    if (window.visualViewport) {
      var syncDock = function () {
        if (!document.body.classList.contains('pvc-chat-open')) return;
        var vv = window.visualViewport;
        var inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        document.documentElement.style.setProperty('--pvc-keyboard-inset', inset + 'px');
      };
      window.visualViewport.addEventListener('resize', syncDock);
      window.visualViewport.addEventListener('scroll', syncDock);
      syncDock();
    }

    if (pref) enter(pref);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
