/**
 * Front Desk · check-in soundtrack autoplays on /front-desk.
 * Unified page soundtrack with popup handoff on navigation.
 */
(function () {
  'use strict';

  function boot() {
    if (!window.QV_initPageSoundtrack) return;
    window.QV_initPageSoundtrack({
      pageId: 'front-desk',
      playlistId: 'pl-reception',
      btnId: 'front-desk-hero-score',
      audioId: 'front-desk-hero-audio',
      label: 'Front Desk soundtrack',
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
