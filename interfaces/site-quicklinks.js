/** Injects top SS VIBELANDIA · Listen quicklinks (in-flow) + footer Bulletin Board.
 * Skip pages that already ship their own primary nav (hero / brochure / ark).
 * Canonical doors: / (Canvas art landing) · /questfest (SS Vibelandia) · /listen · /lattice — never a separate “Bridge”.
 * Also boots live i18n (language bar + surface/paper translation) when missing.
 */
(function () {
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
  if (!document.querySelector('script[src*="i18n-auto.js"]') && !window.__qvI18nBoot) {
    window.__qvI18nBoot = 1;
    if (!document.documentElement.classList.contains('vbi18n-ready')) {
      document.documentElement.classList.add('vbi18n-pending');
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
    i18n.onerror = function () {
      document.documentElement.classList.remove('vbi18n-pending');
      document.documentElement.classList.add('vbi18n-ready');
    };
    document.head.appendChild(i18n);
    window.setTimeout(function () {
      if (!document.documentElement.classList.contains('vbi18n-ready')) {
        document.documentElement.classList.remove('vbi18n-pending');
        document.documentElement.classList.add('vbi18n-ready');
      }
    }, 12000);
  }

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

  function hasListenLink(root) {
    if (!root) return false;
    return !!root.querySelector(
      'a[href*="/listen"], a[href*="#/listen"], a[href*="jukebox"], a[data-qv-jukebox], a.qv-open-jukebox'
    );
  }

  /** Pages that already own an in-flow primary nav — do not stack a second bar. */
  function hasOwnPrimaryNav() {
    return !!(
      document.querySelector('.deck-skin-nav') ||
      document.querySelector('.skin-nav') ||
      document.querySelector('.jb-nav') ||
      document.querySelector('.hero__nav') ||
      document.querySelector('.brochure-nav') ||
      document.querySelector('.ark-hero__nav') ||
      document.querySelector('.cm-topnav')
    );
  }

  function injectTopQuicklinks() {
    if (onBridge) return;
    if (document.querySelector('.qv-top-quicklinks')) return;
    if (hasOwnPrimaryNav()) {
      var existing =
        document.querySelector('.deck-skin-nav') ||
        document.querySelector('.skin-nav') ||
        document.querySelector('.jb-nav');
      if (existing && !hasListenLink(existing)) {
        existing.insertAdjacentHTML(
          'beforeend',
          '<span class="dot" aria-hidden="true">·</span><a href="/listen" data-qv-jukebox>Listen</a>'
        );
      }
      return;
    }

    var nav = document.createElement('nav');
    nav.className = 'qv-top-quicklinks';
    nav.setAttribute('aria-label', 'Site');
    if (onArtLanding) {
      nav.innerHTML =
        '<a href="/questfest">SS Vibelandia</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/library">Library</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/doodles">Doodles</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/creator-studio">Creator Studio</a>';
    } else if (onQuestfestHome) {
      nav.innerHTML =
        '<span class="qv-top-quicklinks__here">SS VIBELANDIA</span>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/">Canvas</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/library">Library</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/doodles">Doodles</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/creator-studio">Creator Studio</a>';
    } else {
      nav.innerHTML =
        '<a href="/questfest">SS VIBELANDIA</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/journey">Journey</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/">Canvas</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/jukebox" data-qv-jukebox>Jukebox</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/library">Library</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/doodles">Doodles</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/creator-studio">Creator Studio</a>';
    }
    document.body.insertBefore(nav, document.body.firstChild);
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
