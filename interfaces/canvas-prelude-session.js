/**
 * Concierto prelude popup session — audio lives here so landing navigation
 * does not unload playback. Syncs with Omniversal Canvas via BroadcastChannel.
 */
(function () {
  'use strict';

  var PRELUDE_NAME = 'qv-canvas-prelude';
  var CHANNEL_NAME = 'qv-canvas-prelude';
  var PLAYLIST = window.CANVAS_PRELUDE_PLAYLIST || [];

  if (!window.name) {
    window.name = PRELUDE_NAME;
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

  function boot() {
    if (prefersReducedMotion() || !PLAYLIST.length) return;

    var index = 0;
    var logged = {};
    var btn = document.getElementById('prelude-toggle');
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
        index: index,
        trackShort: track.short,
        trackAria: track.aria,
      });
    }

    function setUi(playing) {
      var track = current();
      if (btn) {
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        btn.classList.toggle('is-playing', playing);
        btn.textContent = playing ? track.short : 'Sound off · tap to play';
        btn.setAttribute(
          'aria-label',
          playing ? 'Mute soundtrack: ' + track.aria : 'Play soundtrack: ' + track.aria
        );
      }
      if (nowEl) {
        nowEl.innerHTML = '<strong>' + track.aria + '</strong>';
      }
      audio.setAttribute('aria-label', 'Soundtrack: ' + track.aria + ' (prelude session)');
      broadcastState();
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

    function advance() {
      loadTrack(index + 1);
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

    if (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        togglePlayback();
      });
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
