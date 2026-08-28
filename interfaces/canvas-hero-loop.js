/**
 * Omniversal Canvas landing · YouTube hero loop (muted, autoplay, loop)
 * + Concierto prelude via dedicated popup session (/prelude-session):
 *   lightweight player boots instantly — music continues while browsing.
 * Video: https://youtu.be/0hicJ_AZups
 */
(function () {
  'use strict';

  var YOUTUBE_ID = '0hicJ_AZups';
  var JUKEBOX_NAME = 'qv-jukebox';
  var PRELUDE_URL = '/prelude-session?autoplay=1';
  var CHANNEL_NAME = 'qv-jukebox-prelude';
  var PRELUDE_PLAYLIST_ID = 'pl-concierto-prelude';
  var PRELUDE_FEATURES =
    'popup=yes,width=280,height=48,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no';

  var PLAYLIST = window.CANVAS_PRELUDE_PLAYLIST || [];

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

  function trackFromRemote(msg) {
    return (
      labelForTrackId(msg.trackId) ||
      labelFromTitle(msg.trackTitle) ||
      (msg.trackShort && msg.trackAria
        ? { short: msg.trackShort, aria: msg.trackAria }
        : null)
    );
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
    var preludeWin = null;
    var popupBlocked = false;
    var remotePlaying = false;
    var remoteTrack = PLAYLIST[0] || { short: 'Sound on · The Shift', aria: 'Movement V · The Shift' };
    var playRetryTimer = null;

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
      btn.classList.toggle('is-blocked', popupBlocked && !playing);
      btn.textContent = playing
        ? t.short
        : popupBlocked
          ? 'Allow popups · then tap to play'
          : 'Sound off · tap to play';
      btn.setAttribute(
        'aria-label',
        playing ? 'Mute soundtrack: ' + t.aria : 'Play soundtrack: ' + t.aria
      );
    }

    function openPreludeSession() {
      try {
        preludeWin = window.open(PRELUDE_URL, JUKEBOX_NAME, PRELUDE_FEATURES);
      } catch (_) {
        preludeWin = null;
      }
      if (!preludeWin) {
        popupBlocked = true;
        setToggleState(false, remoteTrack);
        return null;
      }
      popupBlocked = false;
      try {
        window.focus();
      } catch (_) {}
      return preludeWin;
    }

    function postToPrelude(type) {
      if (channel) {
        channel.postMessage({
          type: type,
          playlistId: PRELUDE_PLAYLIST_ID,
        });
      }
    }

    function schedulePlayRetries() {
      if (playRetryTimer) return;
      var attempts = 0;
      playRetryTimer = window.setInterval(function () {
        if (remotePlaying || popupBlocked) {
          window.clearInterval(playRetryTimer);
          playRetryTimer = null;
          return;
        }
        attempts += 1;
        postToPrelude('play');
        if (attempts >= 8) {
          window.clearInterval(playRetryTimer);
          playRetryTimer = null;
        }
      }, 350);
    }

    function ensurePreludeAndPlay() {
      openPreludeSession();
      if (popupBlocked) {
        return Promise.resolve(false);
      }
      postToPrelude('play');
      schedulePlayRetries();
      return Promise.resolve(true);
    }

    function pausePrelude() {
      postToPrelude('pause');
      remotePlaying = false;
      setToggleState(false, remoteTrack);
    }

    if (channel) {
      channel.addEventListener('message', function (ev) {
        var msg = ev && ev.data;
        if (!msg || msg.type !== 'state') return;
        if (msg.playlistId && msg.playlistId !== PRELUDE_PLAYLIST_ID) return;
        remotePlaying = !!msg.playing;
        var mapped = trackFromRemote(msg) || remoteTrack;
        if (mapped) remoteTrack = mapped;
        setToggleState(remotePlaying, remoteTrack);
        if (remotePlaying && playRetryTimer) {
          window.clearInterval(playRetryTimer);
          playRetryTimer = null;
        }
      });
      channel.postMessage({ type: 'ping' });
    }

    if (btn) {
      btn.hidden = false;
      setToggleState(false, PLAYLIST[0] || remoteTrack);
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (remotePlaying) {
          pausePrelude();
          return;
        }
        ensurePreludeAndPlay();
      });
    }
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
