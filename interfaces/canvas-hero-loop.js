/**
 * Omniversal Canvas landing · YouTube hero loop (muted, autoplay, loop)
 * + Concierto prelude via jukebox now-playing session (qv-jukebox):
 *   opens pl-concierto-prelude in the Sovereign Player — music continues while browsing.
 * Video: https://youtu.be/0hicJ_AZups
 */
(function () {
  'use strict';

  var YOUTUBE_ID = '0hicJ_AZups';
  var JUKEBOX_NAME = 'qv-jukebox';
  var CHANNEL_NAME = 'qv-jukebox-prelude';
  var PRELUDE_PLAYLIST_ID = 'pl-concierto-prelude';
  var JUKEBOX_FEATURES =
    'popup=yes,width=420,height=780,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';

  var PLAYLIST = window.CANVAS_PRELUDE_PLAYLIST || [];

  function jukeboxPreludeUrl(autoplay) {
    var q = 'playlist=' + encodeURIComponent(PRELUDE_PLAYLIST_ID);
    if (autoplay) q += '&autoplay=1';
    return '/interfaces/questfest-bridge/#/listen?' + q;
  }

  function labelForTrackId(trackId) {
    for (var i = 0; i < PLAYLIST.length; i++) {
      if (PLAYLIST[i].id === trackId) return PLAYLIST[i];
    }
    return null;
  }

  function labelFromTitle(title) {
    if (!title) return null;
    var lower = String(title).toLowerCase();
    for (var i = 0; i < PLAYLIST.length; i++) {
      if (String(PLAYLIST[i].label).toLowerCase() === lower) return PLAYLIST[i];
      if (String(PLAYLIST[i].aria).toLowerCase() === lower) return PLAYLIST[i];
    }
    return null;
  }

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

  function bootSoundtrack() {
    if (prefersReducedMotion()) return;

    var btn = document.getElementById('canvas-hero-score');
    var channel = null;
    var jukeboxWin = null;
    var useFallback = false;
    var remotePlaying = false;
    var remoteTrack = PLAYLIST[0] || { short: 'Sound on · The Shift', aria: 'Movement V · The Shift' };

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

    function openJukeboxSession(autoplay) {
      if (useFallback) return null;
      var url = jukeboxPreludeUrl(autoplay !== false);
      try {
        jukeboxWin = window.open(url, JUKEBOX_NAME, JUKEBOX_FEATURES);
      } catch (_) {
        jukeboxWin = null;
      }
      if (!jukeboxWin) {
        useFallback = true;
        return null;
      }
      try {
        jukeboxWin.focus();
      } catch (_) {}
      return jukeboxWin;
    }

    function postToJukebox(type) {
      if (channel) {
        channel.postMessage({
          type: type,
          playlistId: PRELUDE_PLAYLIST_ID,
        });
        return;
      }
      if (jukeboxWin && !jukeboxWin.closed) {
        try {
          jukeboxWin.focus();
        } catch (_) {}
      }
    }

    function bootFallbackPlayer() {
      var fallbackAudio = document.getElementById('canvas-hero-shift');
      if (!fallbackAudio || !PLAYLIST.length) return;

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
          try {
            fetch('/api/catalog-plays', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ trackId: track.id }),
              keepalive: true,
            }).catch(function () {});
          } catch (_) {}
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

      loadTrack(0);

      fallbackAudio.addEventListener('play', markPlaying);
      fallbackAudio.addEventListener('pause', function () {
        if (!fallbackAudio.ended) {
          remotePlaying = false;
          setToggleState(false, current());
        }
      });
      fallbackAudio.addEventListener('ended', function () {
        loadTrack(index + 1);
        tryPlay();
      });

      window.__canvasPreludeTryPlay = tryPlay;
      window.__canvasPreludePause = function () {
        fallbackAudio.pause();
        remotePlaying = false;
        setToggleState(false, current());
      };
    }

    function ensureJukeboxAndPlay() {
      openJukeboxSession(true);
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
      postToJukebox('play');
      return Promise.resolve(true);
    }

    function pauseJukebox() {
      if (useFallback && window.__canvasPreludePause) {
        window.__canvasPreludePause();
        return;
      }
      postToJukebox('pause');
      remotePlaying = false;
      setToggleState(false, remoteTrack);
    }

    if (channel) {
      channel.addEventListener('message', function (ev) {
        var msg = ev && ev.data;
        if (!msg || msg.type !== 'state') return;
        if (msg.playlistId && msg.playlistId !== PRELUDE_PLAYLIST_ID) return;
        remotePlaying = !!msg.playing;
        var mapped =
          labelForTrackId(msg.trackId) ||
          labelFromTitle(msg.trackTitle) ||
          remoteTrack;
        if (mapped) remoteTrack = mapped;
        setToggleState(remotePlaying, remoteTrack);
      });
      channel.postMessage({ type: 'ping' });
    }

    if (btn) {
      btn.hidden = false;
      setToggleState(false, PLAYLIST[0] || remoteTrack);
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (remotePlaying) {
          pauseJukebox();
          return;
        }
        ensureJukeboxAndPlay();
      });
    }

    function unlockOnGesture() {
      ensureJukeboxAndPlay();
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
