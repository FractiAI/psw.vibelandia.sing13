/**
 * Jukebox stays in this tab. Links that leave the bridge open in a browse
 * window so playback is not unloaded. Listen CTAs navigate (or refocus) the
 * jukebox — they do not spawn a second player.
 *
 * No floating overlay buttons — site chrome uses top quicklinks instead.
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

  function isPrimaryShipDoor(url) {
    if (window.QV_isPrimaryShipDoor) return window.QV_isPrimaryShipDoor(url);
    if (!url) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    var path = String(url.pathname || '').replace(/\/+$/, '') || '/';
    path = path.toLowerCase();
    if (path === '/') return true;
    return (
      path === '/questfest' ||
      path.indexOf('/questfest/') === 0 ||
      path === '/reading-room' ||
      path.indexOf('/reading-room/') === 0 ||
      path === '/front-desk' ||
      path.indexOf('/front-desk/') === 0 ||
      path === '/journey' ||
      path.indexOf('/journey/') === 0 ||
      path.indexOf('/interfaces/vibelandia-questfest') !== -1 ||
      path.indexOf('/interfaces/reading-room') !== -1 ||
      path.indexOf('/interfaces/front-desk') !== -1 ||
      path.indexOf('/interfaces/omniverse-canvas') !== -1 ||
      path === '/art' ||
      path === '/omniverse-canvas' ||
      path === '/canvas'
    );
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
    if (window.QV_canUseSoundPopup && !window.QV_canUseSoundPopup()) return null;
    var win = null;
    try {
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
    try {
      return window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e3) {
      return null;
    }
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
    var jukeboxUrl = JUKEBOX_URL;
    if (window.QV_isPageSoundtrackPlaying && window.QV_isPageSoundtrackPlaying()) {
      openBrowse(jukeboxUrl);
      return;
    }
    // Always navigate this tab so "Open Jukebox" never looks dead when a
    // hidden opener exists (browse popups used to only focus the player).
    if (window.opener && !window.opener.closed) {
      try {
        if (String(window.opener.location.pathname || '').indexOf('questfest-bridge') !== -1) {
          window.opener.location.hash = '#/listen';
          try {
            window.opener.focus();
          } catch (eFocus) {
            /* ignore */
          }
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
      if (window.QV_isPageSoundtrackPlaying && window.QV_isPageSoundtrackPlaying()) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        openBrowse(JUKEBOX_URL);
        return;
      }
      focusJukeboxOrGo(evt);
      return;
    }

    if (!isBridgeSurface()) {
      var anchorBrowse = t.closest('a[href][data-qv-browse], a.rr-card[href]');
      if (anchorBrowse) {
        var browseUrl = resolveUrl(anchorBrowse.getAttribute('href'));
        if (browseUrl) {
          var browseWin = null;
          if (window.QV_openPaperBrowse) {
            browseWin = window.QV_openPaperBrowse(browseUrl.href);
          } else {
            browseWin = openBrowse(browseUrl.href);
          }
          if (browseWin) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
          }
          return;
        }
      }
      if (window.QV_isPageSoundtrackPlaying && window.QV_isPageSoundtrackPlaying()) {
        var anchorOff = t.closest('a[href]');
        if (anchorOff && leavesBridge(anchorOff)) {
          var offUrl = resolveUrl(anchorOff.getAttribute('href'));
          if (offUrl && !isPrimaryShipDoor(offUrl)) {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            openBrowse(offUrl.href);
          }
        }
      }
      return;
    }

    var anchor = t.closest('a[href]');
    if (!anchor || !leavesBridge(anchor)) return;

    var url = resolveUrl(anchor.getAttribute('href'));
    if (!url) return;
    evt.preventDefault();
    evt.stopPropagation();
    openBrowse(url.href);
  }

  function boot() {
    claimJukeboxName();
    document.addEventListener('click', onClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
