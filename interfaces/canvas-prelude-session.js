/**
 * Concierto prelude popup session — lightweight audio player that boots instantly.
 * Playback lives here so landing navigation does not unload the soundtrack.
 * Syncs with Omniversal Canvas via BroadcastChannel (qv-jukebox-prelude).
 */
(function () {
  'use strict';

  var JUKEBOX_NAME = 'qv-jukebox';
  var CHANNEL_NAME = 'qv-jukebox-prelude';
  var PRELUDE_PLAYLIST_ID = 'pl-concierto-prelude';
  var PLAYLIST = window.CANVAS_PRELUDE_PLAYLIST || [];

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

  function wantsAutoplay() {
    try {
      var params = new URLSearchParams(window.location.search);
      return params.get('autoplay') === '1';
    } catch (_) {
      return false;
    }
  }

  function returnToLanding() {
    try {
      if (window.opener && !window.opener.closed) {
        try {
          var openerPath = window.opener.location.pathname || '/';
          if (openerPath.indexOf('prelude-session') !== -1) {
            window.opener.location.replace('/');
          }
        } catch (_) {
          /* cross-origin — focus only */
        }
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

  function boot() {
    if (prefersReducedMotion() || !PLAYLIST.length) return;

    var index = 0;
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
      return PLAYLIST[index];
    }

    function broadcastState() {
      if (!channel) return;
      var track = current();
      var playing = !audio.paused && !audio.ended;
      channel.postMessage({
        type: 'state',
        playing: playing,
        playlistId: PRELUDE_PLAYLIST_ID,
        trackId: track.id,
        trackTitle: track.aria,
        trackShort: track.short,
        trackAria: track.aria,
      });
    }

    function setUi(playing) {
      var track = current();
      if (nowEl) {
        nowEl.textContent = playing
          ? 'Concierto prelude · ' + track.aria
          : 'Concierto prelude · paused';
      }
      audio.setAttribute('aria-label', 'Soundtrack: ' + track.aria + ' (prelude session)');
      broadcastState();
      if (playing) {
        returnToLanding();
        tuckPopup();
      }
    }

    function loadTrack(i) {
      index = ((i % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
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
      if (msg.type === 'play') {
        tryPlay();
      } else if (msg.type === 'pause') {
        pausePlayback();
      } else if (msg.type === 'toggle') {
        togglePlayback();
      } else if (msg.type === 'ping') {
        broadcastState();
      }
    }

    loadTrack(0);

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
      broadcastState();
    }

    if (wantsAutoplay()) {
      tryPlay();
    }

    window.QV_preludeSession = {
      play: tryPlay,
      pause: pausePlayback,
      toggle: togglePlayback,
      broadcastState: broadcastState,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
