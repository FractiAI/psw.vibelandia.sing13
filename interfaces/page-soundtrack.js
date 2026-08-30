/**
 * Unified page soundtrack — autoplay on arrival, sound toggle, stop prior music,
 * popup handoff when the guest leaves the page.
 */
(function () {
  'use strict';

  var CHANNEL_NAME = 'qv-page-soundtrack';
  var POPUP_NAME = 'qv-soundtrack-session';
  var DEFAULT_SESSION_PATH = '/prelude-session';
  var activePageId = null;
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

  window.QV_initPageSoundtrack = function (opts) {
    if (!opts || prefersReducedMotion()) return;

    var pageId =
      opts.pageId ||
      (opts.playlistId || 'static') + ':' + (opts.btnId || opts.audioId || 'default');
    var btn = opts.btnId ? document.getElementById(opts.btnId) : null;
    var label = opts.label || 'Soundtrack';

    resolvePlaylist(opts).then(function (playlist) {
      if (!playlist.length) return;

      var index = 0;
      var logged = {};
      var handoffDone = false;
      var localActive = true;

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

      audio.loop = false;
      audio.preload = 'auto';

      function current() {
        return playlist[index];
      }

      function setToggleState(playing) {
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
        index = ((i % playlist.length) + playlist.length) % playlist.length;
        var track = current();
        audio.src = track.src;
        audio.setAttribute('aria-label', label + ': ' + track.aria);
        setToggleState(false);
      }

      function markPlaying() {
        var track = current();
        setToggleState(true);
        if (!logged[track.id]) {
          logged[track.id] = true;
          pingCatalogPlay(track.id);
        }
        broadcast({
          type: 'state',
          pageId: pageId,
          playlistId: opts.playlistId || null,
          playing: true,
          trackId: track.id,
          index: index,
        });
      }

      function markStopped() {
        setToggleState(false);
        broadcast({
          type: 'state',
          pageId: pageId,
          playlistId: opts.playlistId || null,
          playing: false,
          index: index,
        });
      }

      function tryPlay() {
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
        localActive = false;
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
        loadTrack(index + 1);
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

      function onPageHide() {
        if (handoffDone || !localActive) return;
        if (audio.paused || audio.ended) return;
        handoffDone = true;
        openHandoffPopup(opts, index);
      }

      if (channel) {
        channel.addEventListener('message', onChannelMessage);
      }

      broadcast({ type: 'stop', pageId: pageId, playlistId: opts.playlistId || null });
      activePageId = pageId;
      localActive = true;

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

      window.addEventListener('pagehide', onPageHide);

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
