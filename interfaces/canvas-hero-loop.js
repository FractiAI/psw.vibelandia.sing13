/**
 * Omniversal Canvas landing · YouTube hero loop (muted, autoplay, loop)
 * + Movement V soundtrack: Concierto de El Gran Sol · “The Shift”.
 * Video: https://youtu.be/0hicJ_AZups
 * Track: catalog trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52
 */
(function () {
  'use strict';

  var YOUTUBE_ID = '0hicJ_AZups';
  var SHIFT_TRACK_ID = 'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52';
  var SHIFT_SRC =
    'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
    'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52-movement-v-of-concierto-de-el-gran-sol_-_the-shift_.mp3';
  var SHIFT_LABEL = 'Movement V · The Shift';

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

  function pingCatalogPlay() {
    try {
      fetch('/api/catalog-plays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: SHIFT_TRACK_ID }),
        keepalive: true,
      }).catch(function () {});
    } catch (_) {}
  }

  function setToggleState(btn, playing) {
    if (!btn) return;
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.classList.toggle('is-playing', playing);
    btn.classList.toggle('is-muted', !playing);
    btn.textContent = playing ? 'Sound on · The Shift' : 'Sound off · tap to play';
    btn.setAttribute(
      'aria-label',
      playing
        ? 'Mute soundtrack: ' + SHIFT_LABEL
        : 'Play soundtrack: ' + SHIFT_LABEL
    );
  }

  function bootSoundtrack() {
    if (prefersReducedMotion()) return;

    var audio =
      document.getElementById('canvas-hero-shift') ||
      (function () {
        var el = document.createElement('audio');
        el.id = 'canvas-hero-shift';
        el.preload = 'auto';
        el.loop = true;
        el.setAttribute('playsinline', '');
        el.setAttribute(
          'aria-label',
          'Soundtrack: Concierto de El Gran Sol — Movement V, The Shift'
        );
        el.src = SHIFT_SRC;
        document.body.appendChild(el);
        return el;
      })();

    if (!audio.getAttribute('src')) audio.src = SHIFT_SRC;
    audio.loop = true;
    audio.preload = 'auto';

    var btn = document.getElementById('canvas-hero-score');
    var started = false;
    var playLogged = false;

    function markPlaying() {
      started = true;
      setToggleState(btn, true);
      if (!playLogged) {
        playLogged = true;
        pingCatalogPlay();
      }
    }

    function markStopped() {
      setToggleState(btn, false);
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

    if (btn) {
      btn.hidden = false;
      setToggleState(btn, false);
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

    tryPlay().then(function (ok) {
      if (ok === false || audio.paused) {
        window.addEventListener('pointerdown', unlockOnGesture, true);
        window.addEventListener('keydown', unlockOnGesture, true);
        window.addEventListener('touchstart', unlockOnGesture, { capture: true, passive: true });
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
