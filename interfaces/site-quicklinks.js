/** Injects global Bulletin Board quick link before site footers. */
(function () {
  if (!window.__qvPageViewsBoot && !document.querySelector('script[data-qv-page-views]')) {
    var pv = document.createElement('script');
    pv.src = '/interfaces/site-page-views.js';
    pv.defer = true;
    pv.setAttribute('data-qv-page-views', '1');
    document.head.appendChild(pv);
  }

  if (!document.querySelector('link[href*="brand-gold-surfaces"]')) {
    const brand = document.createElement('link');
    brand.rel = 'stylesheet';
    brand.href = '/interfaces/brand-gold-surfaces.css';
    document.head.appendChild(brand);
  }

  if (document.querySelector('.site-quicklinks')) return;

  const path = window.location.pathname || '';
  if (
    path.includes('turner-bison-herd-management') ||
    path.includes('bulletin-board') ||
    path === '/' ||
    path.endsWith('vibelandia-questfest.html')
  ) {
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'site-quicklinks';
  nav.setAttribute('aria-label', 'Global quick links');
  nav.innerHTML =
    '<p>SS Vibelandia</p>' +
    '<a href="/bulletin-board">SS Vibelandia Bulletin Board</a>';

  const footer = document.querySelector('footer');
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(nav, footer);
  } else {
    document.body.appendChild(nav);
  }
})();
