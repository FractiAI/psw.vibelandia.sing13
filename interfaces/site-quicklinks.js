/** Injects global Bulletin Board + jukebox / QUESTFEST quick links. */
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

  if (document.querySelector('.site-quicklinks')) return;

  var path = window.location.pathname || '';
  if (
    path.includes('turner-bison-herd-management') ||
    path.includes('bulletin-board') ||
    path === '/' ||
    path.endsWith('vibelandia-questfest.html') ||
    path.includes('ss-vibelandia') ||
    path.includes('noahs-ark') ||
    path.includes('questfest-bridge')
  ) {
    return;
  }

  var nav = document.createElement('nav');
  nav.className = 'site-quicklinks';
  nav.setAttribute('aria-label', 'Global quick links');
  nav.innerHTML =
    '<p>SS Vibelandia</p>' +
    '<a href="#" class="qv-open-jukebox" data-qv-jukebox>Listen · Jukebox</a>' +
    '<span class="sep" aria-hidden="true">·</span>' +
    '<a href="/interfaces/vibelandia-questfest.html">← QUESTFEST</a>' +
    '<span class="sep" aria-hidden="true">·</span>' +
    '<a href="/bulletin-board">SS Vibelandia Bulletin Board</a>';

  var footer = document.querySelector('footer');
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(nav, footer);
  } else {
    document.body.appendChild(nav);
  }
})();
