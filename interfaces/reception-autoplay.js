/**
 * Phase 2 registration · check-in soundtrack autoplays on /questfest#reception-lobby only.
 * Loads pl-reception from GET /api/catalog — same order as the jukebox check-in set.
 * Sound toggle lives in the top quicklinks bar (#reception-hero-score).
 */
(function () {
  'use strict';

  var PLAYLIST_ID = 'pl-reception';
  var REGISTRATION_HASH = '#reception-lobby';

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  function onRegistrationPage() {
    var hash = window.location.hash || '';
    return hash === REGISTRATION_HASH || hash === '#reception-lobby';
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

  function fetchReceptionPlaylist() {
    return fetch('/api/catalog', { cache: 'no-store' })
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (cat) {
        if (!cat || !cat.playlists || !cat.tracks) return [];
        var pl = cat.playlists.find(function (p) {
          return p.id === PLAYLIST_ID;
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

  var activeController = null;

  function stopSoundtrack() {
    if (!activeController) return;
    activeController.stop();
    activeController = null;
  }

  function bootSoundtrack(playlist) {
    if (prefersReducedMotion() || !playlist.length || !onRegistrationPage()) return;

    if (activeController) {
      activeController.resume();
      return;
    }

    var index = 0;
    var logged = {};
    var btn = document.getElementById('reception-hero-score');
    var soundBar = document.getElementById('reception-sound-bar');

    var audio =
      document.getElementById('reception-hero-audio') ||
      (function () {
        var el = document.createElement('audio');
        el.id = 'reception-hero-audio';
        el.preload = 'auto';
        el.setAttribute('playsinline', '');
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        if (soundBar) soundBar.appendChild(el);
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
        playing ? 'Mute reception soundtrack: ' + track.aria : 'Play reception soundtrack: ' + track.aria
      );
    }

    function loadTrack(i) {
      index = ((i % playlist.length) + playlist.length) % playlist.length;
      var track = current();
      audio.src = track.src;
      audio.setAttribute('aria-label', 'Reception soundtrack: ' + track.aria);
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

    function stop() {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (btn) btn.hidden = true;
    }

    function resume() {
      if (btn) btn.hidden = false;
      if (!audio.src) loadTrack(index);
      tryPlay();
    }

    loadTrack(0);

    if (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        if (!onRegistrationPage()) {
          window.location.hash = 'reception-lobby';
          return;
        }
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

    activeController = { stop: stop, resume: resume };
  }

  function syncRegistrationSound() {
    if (onRegistrationPage()) {
      fetchReceptionPlaylist().then(bootSoundtrack);
      return;
    }
    stopSoundtrack();
    var btn = document.getElementById('reception-hero-score');
    if (btn) btn.hidden = true;
  }

  function boot() {
    syncRegistrationSound();
    window.addEventListener('hashchange', syncRegistrationSound);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
