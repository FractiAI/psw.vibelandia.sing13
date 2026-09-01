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
    return fetch('/api/catalog', { cache: 'no-store' })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (cat) {
        if (!cat || !cat.playlists || !cat.tracks) return [];
        var pl = cat.playlists.find(function (p) {
          return p.id === playlistId;
        });
        if (!pl || !pl.trackIds || !pl.trackIds.length) return [];
        return pl.trackIds
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
      })
      .catch(function () {
        return [];
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

  function isReadingRoomPage() {
    var path = window.location.pathname || '';
    return (
      path === '/reading-room' ||
      path === '/reading-room/' ||
      path.slice(-'reading-room.html'.length) === 'reading-room.html'
    );
  }

  function isBrowsePaperLink(anchor) {
    return anchor && anchor.hasAttribute('data-qv-browse');
  }

  function openBrowsePopup(url) {
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
    var sessionPath = opts.sessionPath || DEFAULT_SESSION_PATH;
    var q = new URLSearchParams();
    if (opts.playlistId) q.set('playlist', opts.playlistId);
    q.set('autoplay', '1');
    q.set('index', String(index));
    var url = sessionPath + '?' + q.toString();
    try {
      var existing = window.open('', POPUP_NAME);
      if (existing && !existing.closed && existing.location) {
        try {
          existing.location.replace(url);
          existing.focus();
          return existing;
        } catch (_) {}
      }
    } catch (_) {}
    return window.open(
      url,
      POPUP_NAME,
      'popup,width=280,height=48,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
    );
  }

  /** Active soundtrack session for the current page (one per document). */
  var activeSession = null;

  window.QV_isPageSoundtrackPlaying = function () {
    if (!activeSession || !activeSession.localActive) return false;
    var audio = activeSession.audio;
    return !!(audio && activeSession.playing && !audio.paused && !audio.ended);
  };

  window.QV_initPageSoundtrack = function (opts) {
    if (!opts || prefersReducedMotion()) return;

    var pageId =
      opts.pageId ||
      (opts.playlistId || 'static') + ':' + (opts.btnId || opts.audioId || 'default');
    var btn = opts.btnId ? document.getElementById(opts.btnId) : null;
    var label = opts.label || 'Soundtrack';

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
      session.handoffDone = true;
      openHandoffPopup(session.opts, session.index);
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
      var forceBrowse = isBrowsePaperLink(anchor);
      if (!forceBrowse && !isSoundtrackPlaying()) return;
      if (!leavesSoundtrackPage(anchor)) return;
      var url = resolveUrl(anchor.getAttribute('href'));
      if (!url) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      openBrowsePopup(url.href);
    }

    function onPageHide() {
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
        btn.hidden = false;
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        btn.classList.toggle('is-playing', playing);
        btn.classList.toggle('is-muted', !playing);
        btn.textContent = playing ? track.short : 'Sound off · tap to play';
        btn.setAttribute(
          'aria-label',
          playing ? 'Mute ' + label + ': ' + track.aria : 'Play ' + label + ': ' + track.aria
        );
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

      function unlockOnGesture() {
        tryPlay().then(function () {
          window.removeEventListener('pointerdown', unlockOnGesture, true);
          window.removeEventListener('keydown', unlockOnGesture, true);
          window.removeEventListener('touchstart', unlockOnGesture, true);
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
            audio.pause();
            markStopped();
            return;
          }
          tryPlay();
        });
      }

      audio.addEventListener('play', markPlaying);
      audio.addEventListener('pause', function () {
        if (!audio.ended) markStopped();
      });
      audio.addEventListener('ended', advance);

      tryPlay().then(function (ok) {
        if (ok === false || audio.paused) {
          window.addEventListener('pointerdown', unlockOnGesture, true);
          window.addEventListener('keydown', unlockOnGesture, true);
          window.addEventListener('touchstart', unlockOnGesture, {
            capture: true,
            passive: true,
          });
        }
      });
    });
  };
})();
