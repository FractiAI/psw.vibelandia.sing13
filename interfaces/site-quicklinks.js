/** Injects top SS VIBELANDIA · Listen quicklinks (in-flow) + footer Bulletin Board.
 * Skip pages that already ship their own primary nav (hero / brochure / ark).
 * Canonical doors: / (Canvas art landing) · /questfest (SS Vibelandia) · /listen · /lattice — never a separate “Bridge”.
 * Also boots live i18n (language bar + surface/paper translation) when missing.
 */
(function () {
  /** Keep in sync with I18N_LIVE_DISABLED in interfaces/i18n-auto.js */
  var I18N_LIVE_DISABLED = true;
  if (I18N_LIVE_DISABLED) {
    window.__VIBELANDIA_I18N_LIVE_DISABLED__ = true;
    if (!document.getElementById('vbi18n-never-hide')) {
      var paint = document.createElement('style');
      paint.id = 'vbi18n-never-hide';
      paint.textContent =
        'html.vbi18n-pending body,html.vbi18n-ready body{visibility:visible!important}';
      (document.head || document.documentElement).appendChild(paint);
    }
    document.documentElement.classList.remove('vbi18n-pending');
    document.documentElement.classList.add('vbi18n-ready');
  }

  if (!window.__qvPageViewsBoot && !document.querySelector('script[data-qv-page-views]')) {
    var pv = document.createElement('script');
    pv.src = '/interfaces/site-page-views.js';
    pv.defer = true;
    pv.setAttribute('data-qv-page-views', '1');
    document.head.appendChild(pv);
  }

  if (!document.querySelector('link[href*="site-quicklinks.css"]')) {
    var qlCss = document.createElement('link');
    qlCss.rel = 'stylesheet';
    qlCss.href = '/interfaces/site-quicklinks.css';
    document.head.appendChild(qlCss);
  }

  if (!document.querySelector('link[href*="brand-gold-surfaces"]')) {
    var brand = document.createElement('link');
    brand.rel = 'stylesheet';
    brand.href = '/interfaces/brand-gold-surfaces.css';
    document.head.appendChild(brand);
  }

  if (!document.querySelector('script[data-qv-jukebox-boot]')) {
    var jb = document.createElement('script');
    jb.src = '/interfaces/site-jukebox.js';
    jb.defer = true;
    jb.setAttribute('data-qv-jukebox-boot', '1');
    document.head.appendChild(jb);
  }

  /** Live language bar + surface/paper translation (i18n-auto.js). */
  if (!I18N_LIVE_DISABLED && !document.querySelector('script[src*="i18n-auto.js"]') && !window.__qvI18nBoot) {
    window.__qvI18nBoot = 1;
    if (!document.querySelector('script[src*="vbi18n-failopen.js"]')) {
      var failopen = document.createElement('script');
      failopen.src = '/interfaces/vbi18n-failopen.js';
      document.head.appendChild(failopen);
    } else if (typeof window.__vbi18nFailOpenReveal === 'function') {
      window.__vbi18nFailOpenReveal();
    }
    if (!document.getElementById('vbi18n-pending-style')) {
      var st = document.createElement('style');
      st.id = 'vbi18n-pending-style';
      st.textContent =
        'html.vbi18n-pending body{visibility:hidden}html.vbi18n-ready body{visibility:visible}';
      document.head.appendChild(st);
    }
    var i18n = document.createElement('script');
    i18n.src = '/interfaces/i18n-auto.js';
    i18n.setAttribute('data-page', 'auto');
    i18n.setAttribute('data-qv-i18n-boot', '1');
    i18n.defer = true;
    i18n.onerror = function () {
      if (typeof window.__vbi18nFailOpenReveal === 'function') {
        window.__vbi18nFailOpenReveal();
      } else {
        document.documentElement.classList.remove('vbi18n-pending');
        document.documentElement.classList.add('vbi18n-ready');
      }
    };
    document.head.appendChild(i18n);
    window.setTimeout(function () {
      if (!document.documentElement.classList.contains('vbi18n-ready')) {
        if (typeof window.__vbi18nFailOpenReveal === 'function') {
          window.__vbi18nFailOpenReveal();
        } else {
          document.documentElement.classList.remove('vbi18n-pending');
          document.documentElement.classList.add('vbi18n-ready');
        }
      }
    }, 3000);
  }

  function lcUnreadTotal() {
    try {
      var raw = localStorage.getItem('letschat.unread.v1');
      if (!raw) return 0;
      var map = JSON.parse(raw);
      return Object.values(map).reduce(function (s, n) { return s + (n || 0); }, 0);
    } catch (_) { return 0; }
  }

  function renderLcBadge(n) {
    return n > 0
      ? ' <span class="ql-lc-badge" aria-label="' + n + ' unread Let\'s Chat message' + (n !== 1 ? 's' : '') + '">' + (n > 9 ? '9+' : n) + '</span>'
      : '';
  }

  function updateLcBadge() {
    var n = lcUnreadTotal();
    var link = document.getElementById('ql-lets-chat-link');
    if (!link) return;
    var badge = link.querySelector('.ql-lc-badge');
    if (n > 0) {
      if (badge) {
        badge.textContent = n > 9 ? '9+' : String(n);
        badge.setAttribute('aria-label', n + ' unread Let\'s Chat message' + (n !== 1 ? 's' : ''));
      } else {
        link.insertAdjacentHTML('beforeend', renderLcBadge(n));
      }
    } else if (badge) {
      badge.remove();
    }
  }

  function initLcBadgeListener() {
    updateLcBadge();
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        var bc = new BroadcastChannel('letschat-unread-v1');
        bc.onmessage = function () { updateLcBadge(); };
      }
    } catch (_) {}
    window.addEventListener('storage', function (e) {
      if (e.key === 'letschat.unread.v1') updateLcBadge();
    });
    // Periodic refresh to catch counts written by other tabs/windows
    window.setInterval(updateLcBadge, 10000);
  }

  // --- Lattice Chat Collaborate unread badge ---

  function collabUnreadTotal() {
    try {
      return Math.max(0, parseInt(localStorage.getItem('lattice-collab.unread.v1') || '0', 10) || 0);
    } catch (_) { return 0; }
  }

  function updateCollabBadge(overrideN) {
    var n = overrideN !== undefined ? overrideN : collabUnreadTotal();
    // Keep badge while Collaborate DMs remain unread — even on /lattice-chat.
    // Count clears only when the SPA marks the peer thread read.
    var link = document.getElementById('ql-lattice-chat-link');
    if (!link) return;
    var badge = link.querySelector('.ql-lc-badge');
    if (n > 0) {
      var label = n + ' unread Collaborate message' + (n !== 1 ? 's' : '');
      if (badge) {
        badge.textContent = n > 9 ? '9+' : String(n);
        badge.setAttribute('aria-label', label);
      } else {
        var span = document.createElement('span');
        span.className = 'ql-lc-badge';
        span.setAttribute('aria-label', label);
        span.textContent = n > 9 ? '9+' : String(n);
        link.appendChild(span);
      }
    } else if (badge) {
      badge.remove();
    }
  }

  function initCollabBadgeListener() {
    updateCollabBadge();
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        var bc = new BroadcastChannel('lattice-collab-unread-v1');
        bc.onmessage = function (ev) {
          var total = ev && ev.data && typeof ev.data.total === 'number' ? ev.data.total : undefined;
          updateCollabBadge(total);
        };
      }
    } catch (_) {}
    window.addEventListener('storage', function (e) {
      if (e.key === 'lattice-collab.unread.v1') updateCollabBadge();
    });
    // Periodic refresh to catch counts written by other tabs/windows
    window.setInterval(function () { updateCollabBadge(); }, 10000);
  }

  // --- End Lattice Chat Collaborate unread badge ---

  /** Baked nav rows ship without badge anchor ids — wire them before listeners run. */
  function ensureQuicklinkBadgeAnchors() {
    var nav = document.querySelector('.qv-top-quicklinks');
    if (!nav) return;
    nav.querySelectorAll('a[href="/lets-chat"], a[href="/lets-chat/"]').forEach(function (a) {
      if (!a.id) a.id = 'ql-lets-chat-link';
    });
    nav.querySelectorAll('a[href="/lattice-chat"], a[href="/lattice-chat/"]').forEach(function (a) {
      if (!a.id) a.id = 'ql-lattice-chat-link';
    });
  }

  var QUICKLINK_SECONDARY =
    '<a href="/lets-chat" id="ql-lets-chat-link">Let\'s Chat</a>' +
    '<span class="sep" aria-hidden="true">·</span>' +
    '<a href="/lattice-chat" id="ql-lattice-chat-link">Lattice Chat</a>' +
    '<span class="sep" aria-hidden="true">·</span>' +
    '<button type="button" class="qv-top-quicklinks__share" id="qf-share-qr-open" data-qv-share-qr>QR Share</button>';

  var path = window.location.pathname || '';
  var onBridge = path.indexOf('questfest-bridge') !== -1;
  var onArtLanding =
    path === '/' ||
    path === '/omniverse-canvas' ||
    path === '/omniverse-canvas/' ||
    path === '/art' ||
    path === '/art/' ||
    path === '/canvas' ||
    path === '/canvas/' ||
    path.endsWith('omniverse-canvas.html');
  var onQuestfestHome =
    path.endsWith('vibelandia-questfest.html') ||
    path.endsWith('/vibelandia-questfest') ||
    path === '/questfest' ||
    path === '/questfest/';
  var onFrontDesk =
    path === '/front-desk' ||
    path === '/front-desk/' ||
    path.endsWith('front-desk.html');
  var onReadingRoom =
    path === '/reading-room' ||
    path === '/reading-room/' ||
    path.endsWith('reading-room.html');

  function hasListenLink(root) {
    if (!root) return false;
    return !!root.querySelector(
      'a[href*="/listen"], a[href*="#/listen"], a[href*="jukebox"], a[data-qv-jukebox], a.qv-open-jukebox'
    );
  }

  /** Pages that already own an in-flow primary nav — hide duplicate once standard bar injects. */
  function hasOwnPrimaryNav() {
    return !!(
      document.querySelector('.deck-skin-nav') ||
      document.querySelector('.skin-nav') ||
      document.querySelector('.jb-nav') ||
      document.querySelector('.hero__nav') ||
      document.querySelector('.brochure-nav') ||
      document.querySelector('.ark-hero__nav') ||
      document.querySelector('.cm-topnav') ||
      document.querySelector('.lib-nav')
    );
  }

  function ensureShareQrModal() {
    if (document.getElementById('qf-share-qr-modal')) return;
    var root = document.createElement('div');
    root.id = 'qf-share-qr-modal';
    root.className = 'qf-share-qr-root';
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'qf-share-qr-title');
    root.innerHTML =
      '<button type="button" class="qf-share-qr-backdrop" data-qr-dismiss aria-label="Close"></button>' +
      '<div class="qf-share-qr-card">' +
      '<button type="button" class="qf-share-qr-close" data-qr-dismiss aria-label="Close">×</button>' +
      '<h2 id="qf-share-qr-title">Share the ship</h2>' +
      '<p class="qf-share-qr-hint">Scan or copy the link when someone asks for the address.</p>' +
      '<div class="qf-share-qr-frame">' +
      '<img id="qf-share-qr-img" src="/interfaces/assets/ssvibelandia-share-qr.png" width="240" height="240" alt="QR code for SS Vibelandia" loading="lazy" decoding="async" />' +
      '</div>' +
      '<p class="qf-share-qr-error" id="qf-share-qr-error" hidden></p>' +
      '<p class="qf-share-qr-url" id="qf-share-qr-url"></p>' +
      '<button type="button" class="qf-share-qr-copy" id="qf-share-qr-copy">Copy link</button>' +
      '<p class="qf-share-qr-copy-msg" id="qf-share-qr-copy-msg" hidden>Copied!</p>' +
      '</div>';
    document.body.appendChild(root);
    if (!document.querySelector('script[src*="questfest-share-qr.js"]')) {
      var qr = document.createElement('script');
      qr.src = '/interfaces/questfest-share-qr.js';
      qr.defer = true;
      document.body.appendChild(qr);
    }
  }

  function renderQuestfestSoundBar() {
    return (
      '<div class="qv-top-quicklinks__sound" id="reception-sound-bar">' +
      '<button type="button" class="qv-top-quicklinks__score reception-hero__score qv-sound-mute" id="reception-hero-score" aria-pressed="false" aria-controls="reception-hero-audio" aria-label="Sound on · Mute SS Vibelandia soundtrack"><span class="qv-sound-mute__icon" aria-hidden="true"></span><span class="qv-sound-mute__label">Sound on</span></button>' +
      '<audio id="reception-hero-audio" preload="auto" playsinline hidden aria-hidden="true" aria-label="Reception check-in soundtrack" src="https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/trk-srv-6025557c-f76c-4a55-bd7c-0fc2d5ffcfb4-Goldilocks%20Holographic%20Cruise%20Ship%20Captain_s%20Welcome.wav"></audio>' +
      '</div>'
    );
  }

  function injectTopQuicklinks() {
    if (onBridge) return;
    if (document.querySelector('.qv-top-quicklinks')) return;

    var nav = document.createElement('nav');
    nav.className = 'qv-top-quicklinks' + (onQuestfestHome ? ' qv-top-quicklinks--questfest' : '');
    nav.setAttribute('aria-label', 'Site');
    var row = document.createElement('div');
    row.className = 'qv-top-quicklinks__row qv-top-quicklinks__row--primary';
    var secondary = document.createElement('div');
    secondary.className = 'qv-top-quicklinks__row qv-top-quicklinks__row--secondary';
    secondary.innerHTML = QUICKLINK_SECONDARY;

    if (onArtLanding) {
      row.innerHTML =
        '<a href="/questfest">SS Vibelandia</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/reading-room">Reading Room</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/doodles">Doodles</a>';
    } else if (onFrontDesk) {
      row.innerHTML =
        '<a href="/questfest">SS VIBELANDIA</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<span class="qv-top-quicklinks__here">Check In</span>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/">Canvas</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/reading-room">Reading Room</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/front-desk-program">Check-in program</a>';
    } else if (onReadingRoom) {
      row.innerHTML =
        '<a href="/questfest">SS VIBELANDIA</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/">Canvas</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<span class="qv-top-quicklinks__here">Reading Room</span>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/front-desk">Check In</a>';
    } else if (onQuestfestHome) {
      row.innerHTML =
        '<span class="qv-top-quicklinks__here">SS VIBELANDIA</span>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/">Canvas</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/reading-room">Reading Room</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/doodles">Doodles</a>';
    } else {
      row.innerHTML =
        '<a href="/questfest">SS VIBELANDIA</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/">Canvas</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/reading-room">Reading Room</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/doodles">Doodles</a>';
    }

    nav.appendChild(row);
    nav.appendChild(secondary);
    if (onQuestfestHome) {
      nav.insertAdjacentHTML('beforeend', renderQuestfestSoundBar());
    }
    document.body.insertBefore(nav, document.body.firstChild);
    document.body.classList.add('qv-has-top-quicklinks');
    ensureShareQrModal();

    if (hasOwnPrimaryNav()) {
      var existing =
        document.querySelector('.deck-skin-nav') ||
        document.querySelector('.skin-nav') ||
        document.querySelector('.jb-nav') ||
        document.querySelector('.lib-nav');
      if (existing && !hasListenLink(existing)) {
        existing.insertAdjacentHTML(
          'beforeend',
          '<span class="dot" aria-hidden="true">·</span><a href="/listen" data-qv-jukebox>Listen</a>'
        );
      }
    }
  }

  function injectFooterQuicklinks() {
    if (document.querySelector('.site-quicklinks')) return;
    if (
      path.includes('turner-bison-herd-management') ||
      path.includes('bulletin-board') ||
      onArtLanding ||
      onQuestfestHome ||
      path.includes('ss-vibelandia') ||
      path.includes('noahs-ark') ||
      path.includes('get-started') ||
      path.includes('questfest-2026-frontier-guide') ||
      path.includes('questfest-guide') ||
      onBridge
    ) {
      return;
    }

    var nav = document.createElement('nav');
    nav.className = 'site-quicklinks';
    nav.setAttribute('aria-label', 'Global quick links');
    nav.innerHTML =
      '<p>SS Vibelandia</p>' +
      '<a href="/questfest">SS VIBELANDIA</a><span class="sep" aria-hidden="true"> · </span>' +
      '<a href="/">Canvas</a><span class="sep" aria-hidden="true"> · </span>' +
      '<a href="/listen" data-qv-jukebox>Listen</a><span class="sep" aria-hidden="true"> · </span>' +
      '<a href="/frontiersman-voyage">Voyage</a><span class="sep" aria-hidden="true"> · </span>' +
      '<a href="/get-started">Board</a>';

    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(nav, footer);
    } else {
      document.body.appendChild(nav);
    }
  }

  function boot() {
    injectTopQuicklinks();
    injectFooterQuicklinks();
    ensureShareQrModal();
    ensureQuicklinkBadgeAnchors();
    initLcBadgeListener();
    initCollabBadgeListener();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
