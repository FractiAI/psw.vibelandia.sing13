/**
 * Omniversal Canvas landing · YouTube hero loop (muted, autoplay, loop)
 * + landing soundtrack playlist:
 *   1) Concierto de El Gran Sol · Movement V · “The Shift”
 *   2) Goldilocks Parabola
 *   3) El Gran Sol’s Return 05 Suite
 *   4) Concierto de El Gran Sol · Movement X · “The Shift”
 *   5) El Gran Sol’s Return 07 Suite
 *   6) El Gran Sol’s Return (organ)
 *   7) Warning Danger Ahead
 *   8) Good Morning New Earth 8.75Hz
 *   9) El Gran Sol’s Return 05 · Finale
 * Video: https://youtu.be/0hicJ_AZups
 */
(function () {
  'use strict';

  var YOUTUBE_ID = '0hicJ_AZups';

  var PLAYLIST = [
    {
      id: 'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52',
      label: 'The Shift',
      short: 'Sound on · The Shift',
      aria: 'Movement V · The Shift',
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-4cb9d993-88b1-495d-b932-376cc14ecf52-movement-v-of-concierto-de-el-gran-sol_-_the-shift_.mp3',
    },
    {
      id: 'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2',
      label: 'Goldilocks Parabola',
      short: 'Sound on · Goldilocks Parabola',
      aria: 'Goldilocks Parabola',
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-ffd82d55-82de-4700-bc7c-21f5aefc9bc2-goldilocks-parabola.mp3',
    },
    {
      id: 'trk-srv-6a76463f-4f6e-4014-8b06-45ebb0b23387',
      label: "El Gran Sol's Return 05 Suite",
      short: "Sound on · Return 05 Suite",
      aria: "El Gran Sol's Return 05 Suite",
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-6a76463f-4f6e-4014-8b06-45ebb0b23387-el-gran-sol_s-return-05-suite.mp3',
    },
    {
      id: 'trk-srv-91b20f70-c30e-49a3-8bef-c00ec4587e64',
      label: 'Movement X · The Shift',
      short: 'Sound on · Movement X',
      aria: 'Movement X · The Shift',
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-91b20f70-c30e-49a3-8bef-c00ec4587e64-movement-x-of-concierto-de-el-gran-sol_-_the-shift_.mp3',
    },
    {
      id: 'trk-srv-7c94d66b-19e8-4208-942d-f885ac400c1f',
      label: "El Gran Sol's Return 07 Suite",
      short: "Sound on · Return 07 Suite",
      aria: "El Gran Sol's Return 07 Suite",
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-7c94d66b-19e8-4208-942d-f885ac400c1f-el-gran-sol_s-return--07-suite.mp3',
    },
    {
      id: 'trk-srv-f617b3b3-1924-4c1f-bde5-77c9e66d1b81',
      label: "El Gran Sol's Return (organ)",
      short: "Sound on · Return (organ)",
      aria: "El Gran Sol's Return (organ)",
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-f617b3b3-1924-4c1f-bde5-77c9e66d1b81-el-gran-sol_s-return%28organ%29.mp3',
    },
    {
      id: 'trk-srv-08a30790-4b50-468f-a019-3a7dfcd5e9ee',
      label: 'Warning Danger Ahead',
      short: 'Sound on · Warning Danger Ahead',
      aria: 'Warning Danger Ahead',
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-08a30790-4b50-468f-a019-3a7dfcd5e9ee--warning-danger-ahead-.mp3',
    },
    {
      id: 'trk-srv-368792a6-4113-4351-965b-88eb09759e50',
      label: 'Good Morning New Earth 8.75Hz',
      short: 'Sound on · Good Morning New Earth',
      aria: 'Good Morning New Earth 8.75Hz',
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-368792a6-4113-4351-965b-88eb09759e50-good-morning-new-earth-8.75hz.m4a',
    },
    {
      id: 'trk-srv-939d3f35-9660-4911-8b5b-c7cb2d3626b3',
      label: "El Gran Sol's Return 05 · Finale",
      short: "Sound on · Return 05 Finale",
      aria: "El Gran Sol's Return 05 · Finale",
      src:
        'https://klep96o4e14lvmyd.public.blob.vercel-storage.com/catalog/' +
        'trk-srv-939d3f35-9660-4911-8b5b-c7cb2d3626b3-el-gran-sol_s-return-05.mp3',
    },
  ];

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
    if (prefersReducedMotion()) return;

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
