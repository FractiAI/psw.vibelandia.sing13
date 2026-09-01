/**
 * Reading Room · Deep Memory concert autoplays on /reading-room.
 * Unified page soundtrack with popup handoff on navigation.
 */
(function () {
  'use strict';

  function boot() {
    if (!window.QV_initPageSoundtrack) return;
    window.QV_initPageSoundtrack({
      pageId: 'reading-room',
      playlistId: 'pl-reading-room',
      btnId: 'reading-room-hero-score',
      audioId: 'reading-room-hero-audio',
      label: 'Reading Room concert',
      autoplay: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
