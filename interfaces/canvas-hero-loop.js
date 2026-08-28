/**
 * Omniversal Canvas landing · YouTube hero loop (muted, autoplay, loop)
 * + in-page Concierto prelude playlist (stops when you leave the page).
 * Video: https://youtu.be/0hicJ_AZups
 */
(function () {
  'use strict';

  var YOUTUBE_ID = '0hicJ_AZups';
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

    var index = 0;
    var logged = {};
    var btn = document.getElementById('canvas-hero-score');

    var audio =
      document.getElementById('canvas-hero-shift') ||
      (function () {
        var el = document.createElement('audio');
        el.id = 'canvas-hero-shift';
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

    function setToggleState(playing) {
      if (!btn) return;
      var track = current();
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.classList.toggle('is-playing', playing);
      btn.classList.toggle('is-muted', !playing);
      btn.textContent = playing ? track.short : 'Sound off · tap to play';
      btn.setAttribute(
        'aria-label',
        playing ? 'Mute soundtrack: ' + track.aria : 'Play soundtrack: ' + track.aria
      );
    }

    function loadTrack(i) {
      index = ((i % PLAYLIST.length) + PLAYLIST.length) % PLAYLIST.length;
      var track = current();
      audio.src = track.src;
      audio.setAttribute(
        'aria-label',
        'Soundtrack: ' + track.aria + ' (landing playlist)'
      );
      setToggleState(false);
    }

    function markPlaying() {
      var track = current();
      setToggleState(true);
      if (!logged[track.id]) {
        logged[track.id] = true;
        pingCatalogPlay(track.id);
      }
    }

    function markStopped() {
      setToggleState(false);
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

    if (btn) {
      btn.hidden = false;
      setToggleState(false);
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
