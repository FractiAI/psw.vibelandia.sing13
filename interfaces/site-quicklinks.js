/** Injects top QUESTFEST · Listen quicklinks (in-flow) + footer Bulletin Board. */
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

  var path = window.location.pathname || '';
  var onBridge = path.indexOf('questfest-bridge') !== -1;
  var onQuestfestHome =
    path === '/' ||
    path.endsWith('vibelandia-questfest.html') ||
    path.endsWith('/vibelandia-questfest');

  function hasListenLink(root) {
    if (!root) return false;
    return !!root.querySelector(
      'a[href*="/listen"], a[href*="#/listen"], a[href*="jukebox"], a[data-qv-jukebox], a.qv-open-jukebox'
    );
  }

  function injectTopQuicklinks() {
    if (onBridge) return;
    if (document.querySelector('.qv-top-quicklinks')) return;
    if (document.querySelector('.jb-nav')) return;

    var deckNav = document.querySelector('.deck-skin-nav');
    if (deckNav) {
      if (!hasListenLink(deckNav)) {
        deckNav.insertAdjacentHTML(
          'beforeend',
          '<span class="dot" aria-hidden="true">·</span><a href="/listen" data-qv-jukebox>Listen</a>'
        );
      }
      return;
    }

    var skinNav = document.querySelector('.skin-nav');
    if (skinNav) {
      if (!hasListenLink(skinNav)) {
        skinNav.insertAdjacentHTML(
          'beforeend',
          '<span class="dot" aria-hidden="true">·</span><a href="/listen" data-qv-jukebox>Listen</a>'
        );
      }
      return;
    }

    var nav = document.createElement('nav');
    nav.className = 'qv-top-quicklinks';
    nav.setAttribute('aria-label', 'Site');
    if (onQuestfestHome) {
      nav.innerHTML =
        '<span class="qv-top-quicklinks__here">QUESTFEST</span>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/listen" data-qv-jukebox>Listen</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/hire-a-goldilocks-valet-concierge">Concierge</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/lattice">Lattice</a>';
    } else {
      nav.innerHTML =
        '<a href="/interfaces/vibelandia-questfest.html">QUESTFEST</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/listen" data-qv-jukebox>Listen</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/hire-a-goldilocks-valet-concierge">Concierge</a>' +
        '<span class="sep" aria-hidden="true">·</span>' +
        '<a href="/lattice">Lattice</a>';
    }
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function injectFooterQuicklinks() {
    if (document.querySelector('.site-quicklinks')) return;
    if (
      path.includes('turner-bison-herd-management') ||
      path.includes('bulletin-board') ||
      onQuestfestHome ||
      path.includes('ss-vibelandia') ||
      path.includes('noahs-ark') ||
      onBridge
    ) {
      return;
    }

    var nav = document.createElement('nav');
    nav.className = 'site-quicklinks';
    nav.setAttribute('aria-label', 'Global quick links');
    nav.innerHTML =
      '<p>SS Vibelandia</p>' +
      '<a href="/bulletin-board">SS Vibelandia Bulletin Board</a>';

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
