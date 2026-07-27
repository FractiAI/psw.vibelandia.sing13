/**
 * Jukebox stays in this tab. Links that leave the bridge open in a browse
 * window so playback is not unloaded. Listen CTAs navigate (or refocus) the
 * jukebox — they do not spawn a second player.
 */
(function () {
  var JUKEBOX_NAME = 'qv-jukebox';
  var BROWSE_NAME = 'qv-site-browse';
  var JUKEBOX_URL = '/interfaces/questfest-bridge/#/listen';
  var QUESTFEST_URL = '/interfaces/vibelandia-questfest.html';
  var BROWSE_FEATURES =
    'popup=yes,width=1100,height=900,menubar=no,toolbar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes';

  function isBridgeSurface() {
    var path = window.location.pathname || '';
    return path.indexOf('questfest-bridge') !== -1;
  }

  function claimJukeboxName() {
    if (isBridgeSurface() && !window.name) {
      window.name = JUKEBOX_NAME;
    }
  }

  function isModifiedClick(evt) {
    return (
      evt.button !== 0 ||
      evt.metaKey ||
      evt.ctrlKey ||
      evt.shiftKey ||
      evt.altKey
    );
  }

  function resolveUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (e) {
      return null;
    }
  }

  function isJukeboxDestination(url) {
    if (!url) return false;
    var path = url.pathname || '';
    if (path.indexOf('questfest-bridge') !== -1) return true;
    if (path === '/listen' || path === '/listen/') return true;
    if (path === '/jukebox' || path === '/jukebox/') return true;
    return false;
  }

  /** True when following this anchor would unload the jukebox document. */
  function leavesBridge(anchor) {
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (anchor.hasAttribute('download')) return false;

    var target = (anchor.getAttribute('target') || '').toLowerCase();
    if (target && target !== '_self') return false;

    var url = resolveUrl(href);
    if (!url) return false;
    if (url.origin === window.location.origin && isJukeboxDestination(url)) {
      return false;
    }
    // Same document, hash-only change (should already be caught by #)
    if (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
    return true;
  }

  function openBrowse(url) {
    var win = null;
    try {
      // Keep opener so the browse window can refocus the jukebox.
      win = window.open(url, BROWSE_NAME, BROWSE_FEATURES);
    } catch (e) {
      win = null;
    }
    if (win) {
      try {
        win.focus();
      } catch (e2) {
        /* ignore */
      }
      return win;
    }
    window.location.href = url;
    return null;
  }

  function focusJukeboxOrGo(evt) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (isBridgeSurface()) {
      window.location.hash = '#/listen';
      window.focus();
      return;
    }
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.focus();
        if (String(window.opener.location.pathname || '').indexOf('questfest-bridge') !== -1) {
          window.opener.location.hash = '#/listen';
          return;
        }
      } catch (e) {
        /* cross-origin opener — fall through */
      }
    }
    window.location.href = JUKEBOX_URL;
  }

  window.QV_JUKEBOX_URL = JUKEBOX_URL;
  window.QV_QUESTFEST_URL = QUESTFEST_URL;
  window.QV_openJukebox = focusJukeboxOrGo;
  window.QV_openBrowse = openBrowse;

  function onClick(evt) {
    if (evt.defaultPrevented || isModifiedClick(evt)) return;
    var t = evt.target;
    if (!t || !t.closest) return;

    var listenHit = t.closest('[data-qv-jukebox], .qv-open-jukebox');
    if (listenHit) {
      focusJukeboxOrGo(evt);
      return;
    }

    if (!isBridgeSurface()) return;

    var anchor = t.closest('a[href]');
    if (!anchor || !leavesBridge(anchor)) return;

    var url = resolveUrl(anchor.getAttribute('href'));
    if (!url) return;
    evt.preventDefault();
    evt.stopPropagation();
    openBrowse(url.href);
  }

  function injectDock() {
    if (document.querySelector('.qv-site-dock')) return;
    if (isBridgeSurface()) return;

    var dock = document.createElement('aside');
    dock.className = 'qv-site-dock';
    dock.setAttribute('aria-label', 'Open jukebox');
    dock.innerHTML =
      '<button type="button" class="qv-site-dock__jukebox" data-qv-jukebox title="Return to the jukebox (keeps playing in its tab)">' +
      '♪ Listen · Jukebox</button>';
    document.body.appendChild(dock);
  }

  function boot() {
    claimJukeboxName();
    document.addEventListener('click', onClick, true);
    injectDock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
