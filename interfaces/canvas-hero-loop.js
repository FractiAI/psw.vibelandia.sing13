/**
 * Omniversal Canvas landing · YouTube hero loop (muted, autoplay, loop)
 * + landing soundtrack playlist in a dedicated prelude popup session:
 *   playback survives navigation — browse links and rooms while music continues.
 * Video: https://youtu.be/0hicJ_AZups
 */
(function () {
  'use strict';

  var YOUTUBE_ID = '0hicJ_AZups';
  var PRELUDE_NAME = 'qv-canvas-prelude';
  var PRELUDE_URL = '/prelude-session';
  var CHANNEL_NAME = 'qv-canvas-prelude';
  var PRELUDE_FEATURES =
    'popup=yes,width=420,height=320,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';

  var PLAYLIST = window.CANVAS_PRELUDE_PLAYLIST || [];

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  function embedSrc(origin) {
    var q = [
      'autoplay=1',
      'mute=1',
      'playsinline=1',
      'loop=1',
      'playlist=' + YOUTUBE_ID,
      'controls=0',
      'modestbranding=1',
      'rel=0',
      'enablejsapi=1',
      'iv_load_policy=3',
      'fs=0',
      'disablekb=1',
    ];
    if (origin) q.push('origin=' + encodeURIComponent(origin));
    return 'https://www.youtube.com/embed/' + YOUTUBE_ID + '?' + q.join('&');
  }

  function bootVideo() {
    if (prefersReducedMotion()) return;
    var origin = typeof location !== 'undefined' ? location.origin : '';
    var url = embedSrc(origin);
    document.querySelectorAll('.hero__video-embed').forEach(function (el) {
      if (el.getAttribute('src')) return;
      el.setAttribute('src', url);
      el.setAttribute('loading', 'eager');
      el.setAttribute('title', 'Landing loop video');
      el.classList.remove('hero__video-embed--loading');
    });
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

  function bootSoundtrack() {
    if (prefersReducedMotion() || !PLAYLIST.length) return;

    var btn = document.getElementById('canvas-hero-score');
    var fallbackAudio = document.getElementById('canvas-hero-shift');
    var channel = null;
    var preludeWin = null;
    var useFallback = false;
    var remotePlaying = false;
    var remoteTrack = PLAYLIST[0];

    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch (_) {
      channel = null;
    }

    function setToggleState(playing, track) {
      if (!btn) return;
      var t = track || remoteTrack || PLAYLIST[0];
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.classList.toggle('is-playing', playing);
      btn.classList.toggle('is-muted', !playing);
      btn.textContent = playing ? t.short : 'Sound off · tap to play';
      btn.setAttribute(
        'aria-label',
        playing ? 'Mute soundtrack: ' + t.aria : 'Play soundtrack: ' + t.aria
      );
    }

    function openPreludeSession() {
      if (useFallback) return null;
      try {
        preludeWin = window.open(PRELUDE_URL, PRELUDE_NAME, PRELUDE_FEATURES);
      } catch (_) {
        preludeWin = null;
      }
      if (!preludeWin) {
        useFallback = true;
        return null;
      }
      try {
        preludeWin.focus();
      } catch (_) {}
      return preludeWin;
    }

    function postToPrelude(type) {
      if (channel) {
        channel.postMessage({ type: type });
        return;
      }
      if (preludeWin && !preludeWin.closed) {
        try {
          preludeWin.focus();
        } catch (_) {}
      }
    }

    function bootFallbackPlayer() {
      if (!fallbackAudio) return;

      var index = 0;
      var logged = {};

      fallbackAudio.loop = false;
      fallbackAudio.preload = 'auto';

      function current() {
        return PLAYLIST[index];
      }

      function loadTrack(i) {
        index = ((i % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
        fallbackAudio.src = current().src;
        setToggleState(false, current());
      }

      function markPlaying() {
        var track = current();
        remoteTrack = track;
        remotePlaying = true;
        setToggleState(true, track);
        if (!logged[track.id]) {
          logged[track.id] = true;
          pingCatalogPlay(track.id);
        }
      }

      function tryPlay() {
        var p = fallbackAudio.play();
        if (p && typeof p.then === 'function') {
          return p
            .then(function () {
              markPlaying();
              return true;
            })
            .catch(function () {
              setToggleState(false, current());
              return false;
            });
        }
        markPlaying();
        return Promise.resolve(true);
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

      loadTrack(0);

      fallbackAudio.addEventListener('play', markPlaying);
      fallbackAudio.addEventListener('pause', function () {
        if (!fallbackAudio.ended) {
          remotePlaying = false;
          setToggleState(false, current());
        }
      });
      fallbackAudio.addEventListener('ended', advance);

      window.__canvasPreludeTryPlay = tryPlay;
      window.__canvasPreludePause = function () {
        fallbackAudio.pause();
        remotePlaying = false;
        setToggleState(false, current());
      };

      tryPlay().then(function (ok) {
        if (ok === false || fallbackAudio.paused) {
          window.addEventListener('pointerdown', unlockOnGesture, true);
          window.addEventListener('keydown', unlockOnGesture, true);
          window.addEventListener('touchstart', unlockOnGesture, {
            capture: true,
            passive: true,
          });
        }
      });
    }

    function ensurePreludeAndPlay() {
      openPreludeSession();
      if (useFallback) {
        if (!window.__canvasPreludeBooted) {
          bootFallbackPlayer();
          window.__canvasPreludeBooted = true;
        }
        if (window.__canvasPreludeTryPlay) {
          return window.__canvasPreludeTryPlay();
        }
        return Promise.resolve(false);
      }
      postToPrelude('play');
      return Promise.resolve(true);
    }

    function pausePrelude() {
      if (useFallback && window.__canvasPreludePause) {
        window.__canvasPreludePause();
        return;
      }
      postToPrelude('pause');
      remotePlaying = false;
      setToggleState(false, remoteTrack);
    }

    if (channel) {
      channel.addEventListener('message', function (ev) {
        var msg = ev && ev.data;
        if (!msg || msg.type !== 'state') return;
        remotePlaying = !!msg.playing;
        if (msg.trackShort && msg.trackAria) {
          remoteTrack = { short: msg.trackShort, aria: msg.trackAria };
        }
        setToggleState(remotePlaying, remoteTrack);
      });
      channel.postMessage({ type: 'ping' });
    }

    if (btn) {
      btn.hidden = false;
      setToggleState(false, PLAYLIST[0]);
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (remotePlaying) {
          pausePrelude();
          return;
        }
        ensurePreludeAndPlay();
      });
    }

    function unlockOnGesture() {
      ensurePreludeAndPlay();
      window.removeEventListener('pointerdown', unlockOnGesture, true);
      window.removeEventListener('keydown', unlockOnGesture, true);
      window.removeEventListener('touchstart', unlockOnGesture, true);
    }

    window.addEventListener('pointerdown', unlockOnGesture, true);
    window.addEventListener('keydown', unlockOnGesture, true);
    window.addEventListener('touchstart', unlockOnGesture, {
      capture: true,
      passive: true,
    });
  }

  function boot() {
    bootVideo();
    bootSoundtrack();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
