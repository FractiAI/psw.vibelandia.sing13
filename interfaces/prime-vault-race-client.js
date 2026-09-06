/** Prime-Vault Race · guest client — same Lattice / Let's Chat email seat. */
(function () {
  var STORAGE_EMAIL = 'primevault.race.email.v1';
  var SHARED_EMAIL_KEYS = ['letschat.email.v1', 'lattice.email', 'lattice-chat.email'];

  var state = {
    email: '',
    privilege: '',
    receipt: null,
    racing: false,
  };

  var TIERS = [
    {
      id: 'simple_ubiquitin',
      title: 'Tier 1 · Ubiquitin',
      blurb: 'Single-chain monomer · 76 residues. Vault phase-locks; ColabFold runs MSA-free neural fold.',
    },
    {
      id: 'complex_il2',
      title: 'Tier 2 · IL-2 complex',
      blurb: 'Heterodimer-class · 264 residues. Vaults as orthogonal prime containers; ColabFold multimer wall.',
    },
    {
      id: 'frontier_orphan',
      title: 'Tier 3 · Orphan synthetic',
      blurb: 'De novo lattice · 89 residues. No evolutionary MSA required for the vault lane.',
    },
  ];

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
      // Soft-share so Let's Chat / Lattice can prefill the same seat.
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

  function showGate(err) {
    $('pvr-gate').hidden = false;
    $('pvr-arena').hidden = true;
    var box = $('pvr-gate-err');
    if (err) {
      box.hidden = false;
      box.textContent = err;
    } else {
      box.hidden = true;
      box.textContent = '';
    }
  }

  function showArena() {
    $('pvr-gate').hidden = true;
    $('pvr-arena').hidden = false;
    $('pvr-me-label').textContent =
      'Seated as ' + state.email + (state.privilege ? ' · ' + state.privilege : '');
  }

  function fmtMs(ms) {
    if (ms == null || !Number.isFinite(ms)) return '—';
    if (ms < 1) return ms.toFixed(3) + ' ms';
    if (ms < 1000) return ms.toFixed(2) + ' ms';
    return (ms / 1000).toFixed(1) + ' s';
  }

  function tierReceipt(id) {
    return state.receipt && state.receipt.tiers ? state.receipt.tiers[id] : null;
  }

  function renderTiers() {
    var root = $('pvr-tiers');
    root.innerHTML = TIERS.map(function (t) {
      var r = tierReceipt(t.id);
      var pv = r && r.primeVault ? fmtMs(r.primeVault.latencyMs_median) : 'live';
      var cf = r && r.colabfold && r.colabfold.live ? fmtMs(r.colabfold.wallMs) : 'receipt';
      var plddt =
        r && r.colabfold && r.colabfold.plddtMean != null
          ? ' · pLDDT ~' + r.colabfold.plddtMean.toFixed(1)
          : '';
      return (
        '<article class="pvr-card" role="listitem" data-tier="' +
        t.id +
        '">' +
        '<h3>' +
        t.title +
        '</h3>' +
        '<p>' +
        t.blurb +
        '</p>' +
        '<p>Receipt: vault ' +
        pv +
        ' vs ColabFold ' +
        cf +
        plddt +
        '</p>' +
        '<button type="button" class="pvr-btn pvr-btn--tier" data-race="' +
        t.id +
        '">Race this tier</button>' +
        '</article>'
      );
    }).join('');

    root.querySelectorAll('[data-race]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        void raceTier(btn.getAttribute('data-race'));
      });
    });
  }

  async function apiGet(path) {
    var res = await fetch('/api/prime-vault-race' + path, {
      headers: { 'x-lattice-email': state.email },
    });
    return res.json();
  }

  async function signIn(email) {
    state.email = normalizeEmail(email);
    var res = await fetch(
      '/api/prime-vault-race?email=' + encodeURIComponent(state.email),
    );
    var data = await res.json();
    if (!data.ok) {
      showGate(data.reason || 'No seat for this email yet.');
      return;
    }
    state.privilege = data.privilege || '';
    rememberSharedEmail(state.email);
    var board = await apiGet('?race=0');
    if (!board.ok) {
      showGate(board.reason || 'Could not open the race door.');
      return;
    }
    state.receipt = board.receipt;
    if (board.honesty) $('pvr-honesty').textContent = board.honesty;
    renderTiers();
    showArena();
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  async function animateBars(vaultMs, cfMs) {
    var vaultBar = $('pvr-bar-vault');
    var cfBar = $('pvr-bar-cf');
    vaultBar.style.width = '0%';
    cfBar.style.width = '0%';
    $('pvr-time-vault').textContent = '…';
    $('pvr-time-cf').textContent = '…';

    // Vault finishes first (visual beat), then ColabFold fills over a capped playback.
    await sleep(40);
    vaultBar.style.width = '100%';
    $('pvr-time-vault').textContent = fmtMs(vaultMs);

    var playMs = Math.min(2200, Math.max(700, Math.log10(Math.max(cfMs, 1)) * 450));
    var started = performance.now();
    return new Promise(function (resolve) {
      function tick(now) {
        var t = Math.min(1, (now - started) / playMs);
        cfBar.style.width = (t * 100).toFixed(1) + '%';
        $('pvr-time-cf').textContent = fmtMs(cfMs * t);
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          $('pvr-time-cf').textContent = fmtMs(cfMs);
          resolve();
        }
      }
      requestAnimationFrame(tick);
    });
  }

  async function raceTier(tierId) {
    if (state.racing) return;
    state.racing = true;
    var track = $('pvr-track');
    track.hidden = false;
    var meta = TIERS.find(function (t) {
      return t.id === tierId;
    });
    $('pvr-track-title').textContent = 'Racing · ' + (meta ? meta.title : tierId);
    $('pvr-result').textContent = 'Timing prime vault…';

    try {
      var data = await apiGet('?race=1&tier=' + encodeURIComponent(tierId));
      if (!data.ok || !data.race) {
        $('pvr-result').textContent = data.reason || 'Race failed.';
        state.racing = false;
        return;
      }
      var vaultMs = data.race.primeVault.latencyMs;
      var cfMs =
        data.race.colabfold && data.race.colabfold.wallMs != null
          ? data.race.colabfold.wallMs
          : null;
      var plddt =
        data.race.colabfold && data.race.colabfold.plddtMean != null
          ? data.race.colabfold.plddtMean
          : null;

      await animateBars(vaultMs, cfMs || vaultMs * 1e5);

      var speed =
        data.race.speedup != null
          ? ' ~' + Math.round(data.race.speedup).toLocaleString() + '× faster wall'
          : '';
      var conf =
        plddt != null ? ' · ColabFold pLDDT ~' + Number(plddt).toFixed(1) : '';
      $('pvr-result').textContent =
        'Vault ' +
        fmtMs(vaultMs) +
        ' vs ColabFold ' +
        fmtMs(cfMs) +
        speed +
        conf +
        '. Latency race — not a CASP medal.';
    } catch (err) {
      $('pvr-result').textContent = 'Network error racing this tier.';
    }
    state.racing = false;
  }

  $('pvr-gate-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    void signIn($('pvr-email').value);
  });

  $('pvr-signout').addEventListener('click', function () {
    try {
      localStorage.removeItem(STORAGE_EMAIL);
    } catch (_) {}
    state.email = '';
    state.receipt = null;
    showGate();
  });

  var shared = findSharedEmail();
  if (shared) {
    $('pvr-email').value = shared;
    void signIn(shared);
  }
})();
