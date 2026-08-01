/** Per-page visit counter — one fixed bottom-right mark (Shadow DOM + inline styles). */
(function () {
  if (window.__qvPageViewsBoot) return;
  window.__qvPageViewsBoot = true;

  var HOST_ATTR = 'data-qv-page-visits-host';
  var lastSent = { key: '', at: 0 };
  var hostEl = null;
  var labelEl = null;

  var HOST_STYLE =
    'position:fixed!important;right:0.55rem!important;bottom:0.4rem!important;' +
    'left:auto!important;top:auto!important;z-index:2147483000!important;' +
    'margin:0!important;padding:0!important;width:auto!important;height:auto!important;' +
    'max-width:min(42vw,12rem)!important;max-height:1.4rem!important;' +
    'overflow:hidden!important;display:block!important;background:transparent!important;' +
    'border:0!important;box-shadow:none!important;pointer-events:none!important;' +
    'user-select:none!important;contain:layout style!important;isolation:isolate!important;' +
    'transform:translateZ(0)!important;';

  var LABEL_STYLE =
    'display:block;margin:0;padding:0;border:0;background:transparent;' +
    'font:500 0.62rem/1.2 Inter,system-ui,sans-serif;letter-spacing:0.02em;' +
    'color:rgba(168,162,158,0.82);text-align:right;white-space:nowrap;' +
    'overflow:hidden;text-overflow:ellipsis;max-width:100%;pointer-events:none;';

  function loadCss() {
    if (document.querySelector('link[data-qv-page-views-css]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/interfaces/site-page-views.css';
    link.setAttribute('data-qv-page-views-css', '1');
    document.head.appendChild(link);
  }

  function pageKey(loc, extra) {
    loc = loc || window.location;
    var path = (loc.pathname || '/').replace(/\/index\.html$/i, '').replace(/\.html$/i, '') || '/';
    if (path.length > 1 && path.charAt(path.length - 1) === '/') path = path.slice(0, -1);
    if (path.charAt(0) !== '/') path = '/' + path;
    // QUESTFEST landing aliases (site root is the deck, not the jukebox)
    if (
      path === '/questfest' ||
      path === '/interfaces/vibelandia-questfest'
    ) {
      path = '/';
    }
    // Same jukebox surface at /listen and questfest-bridge
    if (
      path === '/interfaces/questfest-bridge' ||
      path === '/questfest-bridge'
    ) {
      path = '/listen';
    }
    // Ark about page aliases
    if (path === '/interfaces/ss-vibelandia' || path === '/noahs-ark') {
      path = '/ss-vibelandia';
    }
    // Get Started aliases
    if (path === '/interfaces/get-started') {
      path = '/get-started';
    }
    var parts = [path];
    var q = new URLSearchParams(loc.search || '');
    ['id', 'item', 'slug', 'service', 'unit', 'campaign', 'module'].forEach(function (k) {
      var v = q.get(k);
      if (v) parts.push(k + '=' + v);
    });
    var hash = (loc.hash || '').replace(/^#/, '');
    if (hash.indexOf('/') === 0) {
      var hashPath = hash.split('?')[0];
      if (hashPath && hashPath !== '/') parts.push(hashPath);
    }
    if (extra) parts.push(String(extra));
    return parts.join('|').slice(0, 200);
  }

  function shouldSend(key) {
    var now = Date.now();
    if (lastSent.key === key && now - lastSent.at < 1500) return false;
    lastSent.key = key;
    lastSent.at = now;
    return true;
  }

  function fmt(n) {
    return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString('en-US') : '—';
  }

  /** Strip legacy / duplicate visit marks so only one host remains. */
  function scrubDuplicates(keep) {
    var nodes = document.querySelectorAll(
      '#site-page-visits, .site-page-visits, [' + HOST_ATTR + ']'
    );
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] !== keep && nodes[i].parentNode) {
        nodes[i].parentNode.removeChild(nodes[i]);
      }
    }
  }

  /** Exactly one fixed host on body, styles isolated from page CSS. */
  function ensureEl() {
    loadCss();
    if (hostEl && hostEl.isConnected && labelEl) {
      scrubDuplicates(hostEl);
      if (hostEl.parentNode !== document.body) document.body.appendChild(hostEl);
      return labelEl;
    }

    scrubDuplicates(null);

    hostEl = document.createElement('div');
    hostEl.id = 'site-page-visits';
    hostEl.className = 'site-page-visits';
    hostEl.setAttribute(HOST_ATTR, '1');
    hostEl.setAttribute('aria-live', 'polite');
    hostEl.setAttribute('aria-atomic', 'true');
    hostEl.setAttribute('role', 'status');
    hostEl.style.cssText = HOST_STYLE;

    var root = hostEl.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent =
      ':host{all:initial;position:fixed!important;right:0.55rem!important;bottom:0.4rem!important;' +
      'left:auto!important;top:auto!important;z-index:2147483000!important;' +
      'display:block!important;pointer-events:none!important;max-width:min(42vw,12rem)!important;' +
      'max-height:1.4rem!important;overflow:hidden!important;}' +
      '@media (max-width:480px){:host{right:0.45rem!important;' +
      'bottom:max(0.35rem,env(safe-area-inset-bottom,0.35rem))!important;}}';
    labelEl = document.createElement('span');
    labelEl.style.cssText = LABEL_STYLE;
    root.appendChild(style);
    root.appendChild(labelEl);

    document.body.appendChild(hostEl);
    return labelEl;
  }

  function render(el, count) {
    if (!el) return;
    el.textContent = 'Visits · ' + fmt(count);
  }

  function postVisits(key, el) {
    fetch('/api/page-views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: key }),
      keepalive: true,
    })
      .then(function (res) {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(function (data) {
        if (data && typeof data.visits === 'number') render(el, data.visits);
      })
      .catch(function () {
        if (el) el.textContent = '';
      });
  }

  function record(loc, extra) {
    var key = pageKey(loc, extra);
    if (!shouldSend(key)) return;
    var el = ensureEl();
    postVisits(key, el);
  }

  window.QVPageViews = {
    pageKey: pageKey,
    record: record,
    recordWithKey: function (key) {
      if (!key || !shouldSend(key)) return;
      var el = ensureEl();
      postVisits(key, el);
    },
  };

  function boot() {
    if (!document.body) return;
    record(window.location);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('hashchange', function () {
    record(window.location);
  });
  window.addEventListener('popstate', function () {
    record(window.location);
  });
})();
