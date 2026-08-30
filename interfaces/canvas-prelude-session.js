/**
 * Soundtrack popup session — continues playback when guests leave a soundtrack page.
 * Supports pl-concierto-prelude (static) and catalog playlists (e.g. pl-reception).
 */
(function () {
  'use strict';

  var CHANNEL_NAME = 'qv-page-soundtrack';
  var JUKEBOX_NAME = 'qv-soundtrack-session';
  var DEFAULT_PLAYLIST_ID = 'pl-concierto-prelude';

  if (!window.name) {
    window.name = JUKEBOX_NAME;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  function queryParam(name, fallback) {
    try {
      var params = new URLSearchParams(window.location.search);
      var v = params.get(name);
      return v == null || v === '' ? fallback : v;
    } catch (_) {
      return fallback;
    }
  }

  function wantsAutoplay() {
    return queryParam('autoplay', '') === '1';
  }

  function playlistId() {
    return queryParam('playlist', DEFAULT_PLAYLIST_ID);
  }

  function startIndex() {
    var n = parseInt(queryParam('index', '0'), 10);
    return Number.isFinite(n) ? n : 0;
  }

  function returnToOpener() {
    try {
      if (window.opener && !window.opener.closed) {
        window.opener.focus();
        return;
      }
    } catch (_) {}
    try {
      window.blur();
    } catch (_) {}
  }

  function tuckPopup() {
    try {
      window.resizeTo(280, 48);
      window.moveTo(8, Math.max(0, (window.screen.availHeight || 600) - 56));
    } catch (_) {}
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

  function fetchPlaylist(id) {
    if (id === DEFAULT_PLAYLIST_ID && window.CANVAS_PRELUDE_PLAYLIST && window.CANVAS_PRELUDE_PLAYLIST.length) {
      return Promise.resolve(window.CANVAS_PRELUDE_PLAYLIST);
    }
    return fetch('/api/catalog', { cache: 'no-store' })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (cat) {
        if (!cat || !cat.playlists || !cat.tracks) return [];
        var pl = cat.playlists.find(function (p) {
          return p.id === id;
        });
        if (!pl || !pl.trackIds || !pl.trackIds.length) return [];
        return pl.trackIds
          .map(function (tid) {
            var tr = cat.tracks[tid];
            if (!tr || !tr.src) return null;
            var label = tr.title || tr.name || 'Track';
            return {
              id: tid,
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

  function boot() {
    if (prefersReducedMotion()) return;

    var plId = playlistId();
    fetchPlaylist(plId).then(function (playlist) {
      if (!playlist.length) return;

      var index = startIndex();
      var logged = {};
      var nowEl = document.getElementById('prelude-now');
      var channel = null;

      try {
        channel = new BroadcastChannel(CHANNEL_NAME);
      } catch (_) {
        channel = null;
      }

      var audio =
        document.getElementById('prelude-audio') ||
        (function () {
          var el = document.createElement('audio');
          el.id = 'prelude-audio';
          el.preload = 'auto';
          el.setAttribute('playsinline', '');
          document.body.appendChild(el);
          return el;
        })();

      audio.loop = false;
      audio.preload = 'auto';

      function current() {
        return playlist[index];
      }

      function broadcastState(playing) {
        if (!channel) return;
        var track = current();
        channel.postMessage({
          type: 'state',
          pageId: 'popup:' + plId,
          playlistId: plId,
          playing: playing,
          trackId: track.id,
          index: index,
        });
      }

      function setUi(playing) {
        var track = current();
        if (nowEl) {
          nowEl.textContent = playing
            ? 'Soundtrack · ' + track.aria
            : 'Soundtrack · paused';
        }
        audio.setAttribute('aria-label', 'Soundtrack: ' + track.aria + ' (session)');
        broadcastState(playing);
        if (playing) {
          returnToOpener();
          tuckPopup();
        }
      }

      function loadTrack(i) {
        index = ((i % playlist.length) + playlist.length) % playlist.length;
        audio.src = current().src;
        setUi(false);
      }

      function markPlaying() {
        var track = current();
        setUi(true);
        if (!logged[track.id]) {
          logged[track.id] = true;
          pingCatalogPlay(track.id);
        }
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
              setUi(false);
              return false;
            });
        }
        markPlaying();
        return Promise.resolve(true);
      }

      function pausePlayback() {
        audio.pause();
        setUi(false);
      }

      function togglePlayback() {
        if (!audio.paused && !audio.ended) {
          pausePlayback();
          return;
        }
        tryPlay();
      }

      function onChannelMessage(ev) {
        var msg = ev && ev.data;
        if (!msg || typeof msg.type !== 'string') return;
        if (msg.type === 'stop') {
          pausePlayback();
        } else if (msg.type === 'toggle') {
          togglePlayback();
        }
      }

      loadTrack(index);

      function advance() {
        loadTrack(index + 1);
        tryPlay();
      }

      audio.addEventListener('play', markPlaying);
      audio.addEventListener('pause', function () {
        if (!audio.ended) setUi(false);
      });
      audio.addEventListener('ended', advance);

      if (channel) {
        channel.addEventListener('message', onChannelMessage);
      }

      if (wantsAutoplay()) {
        tryPlay();
      }

      window.QV_preludeSession = {
        play: tryPlay,
        pause: pausePlayback,
        toggle: togglePlayback,
      };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
