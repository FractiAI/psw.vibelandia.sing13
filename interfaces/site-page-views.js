/** Per-page visit counter — fixed bottom-right, small print. */
(function () {
  if (window.__qvPageViewsBoot) return;
  window.__qvPageViewsBoot = true;

  var lastSent = { key: '', at: 0 };

  function loadCss() {
    if (document.querySelector('link[href*="site-page-views.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/interfaces/site-page-views.css';
    document.head.appendChild(link);
  }

  function pageKey(loc, extra) {
    loc = loc || window.location;
    var path = (loc.pathname || '/').replace(/\/index\.html$/i, '').replace(/\.html$/i, '') || '/';
    if (path.charAt(0) !== '/') path = '/' + path;
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

  function ensureEl() {
    var el = document.getElementById('site-page-visits');
    if (!el) {
      el = document.createElement('div');
      el.id = 'site-page-visits';
      el.className = 'site-page-visits';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    return el;
  }

  function render(el, count) {
    el.textContent = 'Visits · ' + fmt(count);
  }

  function record(loc, extra) {
    var key = pageKey(loc, extra);
    if (!shouldSend(key)) return;
    loadCss();
    var el = ensureEl();
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
        el.textContent = '';
      });
  }

  window.QVPageViews = {
    pageKey: pageKey,
    record: record,
    recordWithKey: function (key) {
      if (!key || !shouldSend(key)) return;
      loadCss();
      var el = ensureEl();
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
          el.textContent = '';
        });
    },
  };

  function boot() {
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
