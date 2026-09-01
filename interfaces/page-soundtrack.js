/**
 * Unified page soundtrack — autoplay on arrival, sound toggle, stop prior music,
 * popup handoff when the guest leaves the page.
 */
(function () {
  'use strict';

  var CHANNEL_NAME = 'qv-page-soundtrack';
  var POPUP_NAME = 'qv-soundtrack-session';
  var BROWSE_NAME = 'qv-site-browse';
  var DEFAULT_SESSION_PATH = '/prelude-session';
  var BROWSE_FEATURES =
    'popup=yes,width=1100,height=900,menubar=no,toolbar=yes,location=yes,status=yes,resizable=yes,scrollbars=yes';
  var channel = null;

  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch (_) {
    channel = null;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  /** Desktop popup handoff only — mobile Safari turns popups into blank tabs. */
  function canUseSoundPopup() {
    if (window.__QV_FORCE_SOUND_POPUP__ === true) return true;
    if (window.__QV_FORCE_SOUND_POPUP__ === false) return false;
    try {
      if (window.matchMedia('(pointer: coarse)').matches) return false;
      if (window.matchMedia('(max-width: 900px)').matches) return false;
    } catch (_) {}
    return true;
  }

  window.QV_canUseSoundPopup = canUseSoundPopup;

  if (!document.querySelector('link[href*="page-soundtrack-mute.css"]')) {
    var muteCss = document.createElement('link');
    muteCss.rel = 'stylesheet';
    muteCss.href = '/interfaces/page-soundtrack-mute.css';
    document.head.appendChild(muteCss);
  }

  function ensureMuteButtonMarkup(button) {
    if (!button) return;
    button.classList.add('qv-sound-mute');
    if (!button.querySelector('.qv-sound-mute__icon')) {
      button.innerHTML = '<span class="qv-sound-mute__icon" aria-hidden="true"></span>';
    }
  }

  function applyMuteButtonState(button, muted, trackAria) {
    if (!button) return;
    ensureMuteButtonMarkup(button);
    button.hidden = false;
    button.classList.toggle('is-muted', !!muted);
    button.classList.toggle('is-playing', !muted);
    button.setAttribute('aria-pressed', muted ? 'true' : 'false');
    if (muted) {
      button.setAttribute('aria-label', 'Unmute soundtrack' + (trackAria ? ': ' + trackAria : ''));
      button.title = 'Muted · tap to unmute';
    } else {
      button.setAttribute('aria-label', 'Mute soundtrack' + (trackAria ? ': ' + trackAria : ''));
      button.title = trackAria ? 'Playing · ' + trackAria + ' · tap to mute' : 'Sound on · tap to mute';
    }
  }

  function pauseLocalSessionQuiet(session) {
    if (!session) return;
    session.handoffDone = true;
    session.playing = false;
    session.localActive = false;
    if (session.audio) {
      try {
        session.audio.pause();
      } catch (_) {}
    }
  }

  function pingCatalogPlay(trackId) {
    try {
      fetch('/api/catalog-plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: trackId }),
        keepalive: true,
      }).catch(function () {});
    } catch (_) {}
  }

  function fetchPlaylistFromCatalog(playlistId) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve([]);
      }, 10000);
      fetch('/api/catalog', { cache: 'no-store' })
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(function (cat) {
          if (settled) return;
          if (!cat || !cat.playlists || !cat.tracks) {
            settled = true;
            window.clearTimeout(timer);
            resolve([]);
            return;
          }
          var pl = cat.playlists.find(function (p) {
            return p.id === playlistId;
          });
          if (!pl || !pl.trackIds || !pl.trackIds.length) {
            settled = true;
            window.clearTimeout(timer);
            resolve([]);
            return;
          }
          var tracks = pl.trackIds
            .map(function (id) {
              var tr = cat.tracks[id];
              if (!tr || !tr.src) return null;
              var label = tr.title || tr.name || 'Track';
              return {
                id: id,
                label: label,
                short: 'Sound on · ' + label,
                aria: label,
                src: tr.src,
              };
            })
            .filter(Boolean);
          settled = true;
          window.clearTimeout(timer);
          resolve(tracks);
        })
        .catch(function () {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve([]);
        });
    });
  }

  function resolvePlaylist(opts) {
    if (opts.staticPlaylist && opts.staticPlaylist.length) {
      return Promise.resolve(opts.staticPlaylist);
    }
    if (opts.playlistId) {
      return fetchPlaylistFromCatalog(opts.playlistId);
    }
    return Promise.resolve([]);
  }

  function broadcast(msg) {
    if (!channel) return;
    try {
      channel.postMessage(msg);
    } catch (_) {}
  }

  function pauseOtherMedia(keepAudio) {
    try {
      document.querySelectorAll('audio, video').forEach(function (el) {
        if (el === keepAudio) return;
        try {
          el.pause();
        } catch (_) {}
      });
    } catch (_) {}
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
    } catch (_) {
      return null;
    }
  }

  /** Canonical ship doors — always navigate in-tab (never the browse popup). */
  function normalizeDoorPath(pathname) {
    var p = String(pathname || '').replace(/\/+$/, '');
    return p || '/';
  }

  function isPrimaryShipDoor(url) {
    if (!url) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    var path = normalizeDoorPath(url.pathname).toLowerCase();
    if (path === '/') return true;
    var doors = [
      '/questfest',
      '/reading-room',
      '/front-desk',
      '/journey',
      '/jukebox',
      '/listen',
      '/doodles',
      '/art',
      '/omniverse-canvas',
      '/canvas',
      '/sin-city',
      '/frontiersman-voyage',
      '/lets-chat',
      '/lattice-chat',
      '/concierto-program',
      '/core',
      '/amphitheater',
      '/horizon',
      '/science-fiction',
      '/step-in',
    ];
    for (var i = 0; i < doors.length; i++) {
      var door = doors[i];
      if (path === door || path.indexOf(door + '/') === 0) return true;
    }
    if (
      path.indexOf('/interfaces/omniverse-canvas') !== -1 ||
      path.indexOf('/interfaces/vibelandia-questfest') !== -1 ||
      path.indexOf('/interfaces/reading-room') !== -1 ||
      path.indexOf('/interfaces/front-desk') !== -1
    ) {
      return true;
    }
    return false;
  }

  window.QV_isPrimaryShipDoor = isPrimaryShipDoor;

  function leavesSoundtrackPage(anchor) {
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (anchor.hasAttribute('download')) return false;

    var target = (anchor.getAttribute('target') || '').toLowerCase();
    if (target && target !== '_self') return false;

    var url = resolveUrl(href);
    if (!url) return false;
    if (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash !== window.location.hash
    ) {
      return false;
    }
    return true;
  }

  /** Paper / browse links — open in popup without unloading the soundtrack page. */
  function shouldBrowsePaperInPopup(anchor) {
    if (!isBrowsePaperLink(anchor)) return false;
    var href = anchor.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (anchor.hasAttribute('download')) return false;
    var url = resolveUrl(href);
    if (!url) return false;
    if (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash !== window.location.hash
    ) {
      return false;
    }
    return true;
  }

  function isReadingRoomPage() {
    var path = window.location.pathname || '';
    return (
      path === '/reading-room' ||
      path === '/reading-room/' ||
      path.slice(-'reading-room.html'.length) === 'reading-room.html'
    );
  }

  function isBrowsePaperLink(anchor) {
    return (
      anchor &&
      (anchor.hasAttribute('data-qv-browse') ||
        (anchor.classList && anchor.classList.contains('rr-card')))
    );
  }

  function openBrowsePopup(url) {
    if (!canUseSoundPopup()) return null;
    if (window.QV_openBrowse) {
      var viaJukebox = window.QV_openBrowse(url);
      if (viaJukebox) return viaJukebox;
      try {
        return window.open(url, BROWSE_NAME, BROWSE_FEATURES);
      } catch (_) {}
      try {
        return window.open(url, '_blank', 'noopener,noreferrer');
      } catch (_) {}
      return null;
    }
    try {
      var win = window.open(url, BROWSE_NAME, BROWSE_FEATURES);
      if (win) {
        try {
          win.focus();
        } catch (_) {}
        return win;
      }
    } catch (_) {}
    try {
      return window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {}
    return null;
  }

  function openHandoffPopup(opts, index) {
    if (!canUseSoundPopup()) return null;
    var sessionPath = opts.sessionPath || DEFAULT_SESSION_PATH;
    var q = new URLSearchParams();
    if (opts.playlistId) q.set('playlist', opts.playlistId);
    q.set('autoplay', '1');
    q.set('index', String(index));
    var url = sessionPath + '?' + q.toString();
    try {
      var win = window.open(
        url,
        POPUP_NAME,
        'popup,width=280,height=48,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
      if (win) {
        try {
          win.focus();
        } catch (_) {}
        return win;
      }
    } catch (_) {}
    return null;
  }

  /** Active soundtrack session for the current page (one per document). */
  var activeSession = null;

  function maybeHandoffActiveSession() {
    var session = activeSession;
    if (!session || !session.localActive || session.handoffDone) return;
    var audio = session.audio;
    if (!audio || audio.paused || audio.ended) return;
    if (!canUseSoundPopup()) {
      pauseLocalSessionQuiet(session);
      return;
    }
    session.handoffDone = true;
    openHandoffPopup(session.opts, session.index);
    try {
      audio.pause();
    } catch (_) {}
    session.playing = false;
  }

  function openPaperBrowse(url) {
    if (!canUseSoundPopup()) return null;
    maybeHandoffActiveSession();
    var win = openBrowsePopup(url);
    if (win) return win;
    try {
      return window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {
      return null;
    }
  }

  function handleBrowsePaperNavigation(ev) {
    if (ev.defaultPrevented || isModifiedClick(ev)) return;
    var t = ev.target;
    if (!t || !t.closest) return;
    var anchor = t.closest('a[href][data-qv-browse], a.rr-card[href]');
    if (!anchor || !shouldBrowsePaperInPopup(anchor)) return;
    var url = resolveUrl(anchor.getAttribute('href'));
    if (!url) return;

    var win = openPaperBrowse(url.href);
    if (win) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
    }
    // Popup blocked — allow native target=_blank navigation on the anchor.
  }

  document.addEventListener('click', handleBrowsePaperNavigation, true);

  window.QV_isPageSoundtrackPlaying = function () {
    if (!activeSession || !activeSession.localActive) return false;
    var audio = activeSession.audio;
    return !!(audio && activeSession.playing && !audio.paused && !audio.ended);
  };

  window.QV_initPageSoundtrack = function (opts) {
    if (!opts || prefersReducedMotion()) return;

    var autoplayDesired = opts.autoplay !== false;
    var userMuted = false;
    var pageId =
      opts.pageId ||
      (opts.playlistId || 'static') + ':' + (opts.btnId || opts.audioId || 'default');
    var btn = opts.btnId ? document.getElementById(opts.btnId) : null;
    var label = opts.label || 'Soundtrack';

    if (btn && autoplayDesired) {
      applyMuteButtonState(btn, false);
      btn.setAttribute('aria-label', 'Loading ' + label);
      btn.title = 'Loading soundtrack…';
    }

    var session = {
      opts: opts,
      pageId: pageId,
      btn: btn,
      label: label,
      audio: null,
      playlist: null,
      index: 0,
      playing: false,
      localActive: false,
      handoffDone: false,
      logged: {},
    };
    activeSession = session;

    function isSoundtrackPlaying() {
      return window.QV_isPageSoundtrackPlaying();
    }

    function handoffIfPlaying() {
      if (!session.localActive || session.handoffDone || !isSoundtrackPlaying()) return false;
      if (!canUseSoundPopup()) {
        pauseLocalSessionQuiet(session);
        return false;
      }
      session.handoffDone = true;
      openHandoffPopup(session.opts, session.index);
      try {
        session.audio.pause();
      } catch (_) {}
      session.playing = false;
      return true;
    }

    function onNavigateClick(ev) {
      if (ev.defaultPrevented || isModifiedClick(ev)) return;
      var t = ev.target;
      if (!t || !t.closest) return;

      var jukeboxHit = t.closest('[data-qv-jukebox], .qv-open-jukebox');
      if (jukeboxHit) {
        if (!isSoundtrackPlaying()) return;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var jukeboxUrl = window.QV_JUKEBOX_URL || '/interfaces/questfest-bridge/#/listen';
        openBrowsePopup(jukeboxUrl);
        return;
      }

      var anchor = t.closest('a[href]');
      if (!anchor) return;
      if (shouldBrowsePaperInPopup(anchor)) return;
      var forceBrowse = isBrowsePaperLink(anchor);
      if (!forceBrowse && !isSoundtrackPlaying()) return;
      if (!leavesSoundtrackPage(anchor)) return;
      var url = resolveUrl(anchor.getAttribute('href'));
      if (!url) return;
      if (isPrimaryShipDoor(url)) {
        pauseLocalSessionQuiet(session);
        return;
      }
      ev.preventDefault();
      ev.stopImmediatePropagation();
      handoffIfPlaying();
      openBrowsePopup(url.href);
    }

    function onPageHide() {
      if (session.handoffDone) return;
      handoffIfPlaying();
    }

    document.addEventListener('click', onNavigateClick, true);
    window.addEventListener('pagehide', onPageHide);

    resolvePlaylist(opts).then(function (playlist) {
      if (!playlist.length) return;
      session.playlist = playlist;

      var audio =
        (opts.audioId && document.getElementById(opts.audioId)) ||
        (function () {
          var el = document.createElement('audio');
          el.id = opts.audioId || 'qv-page-audio';
          el.preload = 'auto';
          el.setAttribute('playsinline', '');
          el.hidden = true;
          el.setAttribute('aria-hidden', 'true');
          if (btn && btn.parentNode) btn.parentNode.appendChild(el);
          else document.body.appendChild(el);
          return el;
        })();

      session.audio = audio;
      audio.loop = false;
      audio.preload = 'auto';

      function current() {
        return playlist[session.index];
      }

      function setToggleState(playing) {
        session.playing = playing;
        if (!btn) return;
        var track = current();
        applyMuteButtonState(btn, userMuted, track.aria);
      }

      function loadTrack(i) {
        session.index = ((i % playlist.length) + playlist.length) % playlist.length;
        var track = current();
        audio.src = track.src;
        audio.setAttribute('aria-label', label + ': ' + track.aria);
        setToggleState(false);
      }

      function markPlaying() {
        pauseOtherMedia(audio);
        var track = current();
        setToggleState(true);
        if (!session.logged[track.id]) {
          session.logged[track.id] = true;
          pingCatalogPlay(track.id);
        }
        broadcast({
          type: 'state',
          pageId: pageId,
          playlistId: opts.playlistId || null,
          playing: true,
          trackId: track.id,
          index: session.index,
        });
      }

      function markStopped() {
        setToggleState(false);
        broadcast({
          type: 'state',
          pageId: pageId,
          playlistId: opts.playlistId || null,
          playing: false,
          index: session.index,
        });
      }

      function tryPlay() {
        pauseOtherMedia(audio);
        broadcast({ type: 'stop', pageId: pageId, playlistId: opts.playlistId || null });
        var p = audio.play();
        if (p && typeof p.then === 'function') {
          return p
            .then(function () {
              markPlaying();
              return true;
            })
            .catch(function () {
              markStopped();
              return false;
            });
        }
        markPlaying();
        return Promise.resolve(true);
      }

      function stopLocal() {
        session.localActive = false;
        session.playing = false;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
        if (btn) btn.hidden = true;
      }

      function bindUnlockGestures() {
        if (unlockBound) return;
        unlockBound = true;
        var events = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'click'];
        function cleanup() {
          events.forEach(function (ev) {
            window.removeEventListener(ev, unlockOnce, true);
          });
          unlockBound = false;
        }
        function unlockOnce() {
          if (userMuted) {
            cleanup();
            return;
          }
          tryPlay().then(function (ok) {
            if (ok !== false && !audio.paused) cleanup();
          });
        }
        events.forEach(function (ev) {
          window.addEventListener(ev, unlockOnce, { capture: true, passive: true });
        });
      }

      function startPlayback() {
        if (!autoplayDesired || userMuted) return;
        tryPlay().then(function (ok) {
          if ((ok === false || audio.paused) && !userMuted) {
            bindUnlockGestures();
          }
        });
      }

      function advance() {
        loadTrack(session.index + 1);
        tryPlay();
      }

      function onChannelMessage(ev) {
        var msg = ev && ev.data;
        if (!msg || typeof msg.type !== 'string') return;
        if (msg.type === 'stop' && msg.pageId !== pageId) {
          stopLocal();
          return;
        }
        if (msg.type === 'toggle' && msg.pageId === pageId) {
          if (!audio.paused && !audio.ended) {
            audio.pause();
            markStopped();
          } else {
            tryPlay();
          }
        }
      }

      if (channel) {
        channel.addEventListener('message', onChannelMessage);
      }

      pauseOtherMedia(audio);
      broadcast({ type: 'stop', pageId: pageId, playlistId: opts.playlistId || null });
      session.localActive = true;

      loadTrack(0);

      if (btn) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (!audio.paused && !audio.ended) {
            userMuted = true;
            audio.pause();
            markStopped();
            return;
          }
          userMuted = false;
          tryPlay();
        });
      }

      audio.addEventListener('play', markPlaying);
      audio.addEventListener('pause', function () {
        if (!audio.ended) markStopped();
      });
      audio.addEventListener('ended', advance);

      startPlayback();

      window.addEventListener('pageshow', function () {
        if (autoplayDesired && !userMuted && audio.paused) {
          startPlayback();
        }
      });
    });
  };

  window.QV_openPaperBrowse = openPaperBrowse;
  window.QV_handoffPageSoundtrack = maybeHandoffActiveSession;
})();
