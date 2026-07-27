/**
 * Sitewide jukebox launcher — opens Listen in a named window so music
 * keeps playing while visitors browse other pages in the main tab.
 */
(function () {
  var JUKEBOX_NAME = 'qv-jukebox';
  var JUKEBOX_URL = '/interfaces/questfest-bridge/#/listen';
  var QUESTFEST_URL = '/interfaces/vibelandia-questfest.html';
  var FEATURES =
    'popup=yes,noopener=yes,noreferrer=yes,width=980,height=820,menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes';

  function isJukeboxWindow() {
    return window.name === JUKEBOX_NAME;
  }

  function isBridgeSurface() {
    var path = window.location.pathname || '';
    return path.indexOf('questfest-bridge') !== -1;
  }

  function openJukebox(evt) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (isJukeboxWindow()) {
      window.focus();
      return null;
    }
    var win = null;
    try {
      win = window.open(JUKEBOX_URL, JUKEBOX_NAME, FEATURES);
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
    window.location.href = JUKEBOX_URL;
    return null;
  }

  window.QV_JUKEBOX_URL = JUKEBOX_URL;
  window.QV_QUESTFEST_URL = QUESTFEST_URL;
  window.QV_openJukebox = openJukebox;

  function wireDelegates(root) {
    root.addEventListener('click', function (evt) {
      var t = evt.target;
      if (!t || !t.closest) return;
      var hit = t.closest('[data-qv-jukebox], .qv-open-jukebox');
      if (!hit) return;
      openJukebox(evt);
    });
  }

  function injectDock() {
    if (document.querySelector('.qv-site-dock')) return;

    var dock = document.createElement('aside');
    dock.className = 'qv-site-dock';
    dock.setAttribute('aria-label', 'Jukebox and QUESTFEST');

    if (isJukeboxWindow()) {
      dock.className += ' qv-site-dock--jukebox-window';
      dock.innerHTML =
        '<p class="qv-site-dock__note">Jukebox window — keep open while you browse</p>' +
        '<a class="qv-site-dock__quest" href="' +
        QUESTFEST_URL +
        '" target="_blank" rel="noopener">← QUESTFEST</a>';
    } else {
      dock.innerHTML =
        '<button type="button" class="qv-site-dock__jukebox" data-qv-jukebox title="Opens in a side window so music keeps playing while you browse">' +
        '♪ Listen · Jukebox</button>' +
        '<a class="qv-site-dock__quest" href="' +
        QUESTFEST_URL +
        '">← QUESTFEST</a>';
      if (isBridgeSurface()) {
        dock.className += ' qv-site-dock--on-bridge';
      }
    }

    document.body.appendChild(dock);
  }

  function boot() {
    wireDelegates(document);
    injectDock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
