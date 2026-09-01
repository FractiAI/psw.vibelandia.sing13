/**
 * SS Vibelandia board · reception soundtrack autoplays on /questfest.
 * Unified page soundtrack with popup handoff on navigation.
 */
(function () {
  'use strict';

  function boot() {
    if (!window.QV_initPageSoundtrack) return;
    window.QV_initPageSoundtrack({
      pageId: 'questfest-home',
      playlistId: 'pl-reception',
      btnId: 'reception-hero-score',
      audioId: 'reception-hero-audio',
      label: 'SS Vibelandia soundtrack',
      autoplay: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
