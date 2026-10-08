/**
 * Golden Y Frontier Club · Cool Jazz soundtrack autoplays on /golden-y-frontier-club.
 * Unified page soundtrack with popup handoff on navigation (same rail as Canvas / Reading Room).
 */
(function () {
  'use strict';

  function boot() {
    if (!window.QV_initPageSoundtrack) return;
    window.QV_initPageSoundtrack({
      pageId: 'golden-y-frontier-club',
      playlistId: 'pl-1791170281395',
      staticPlaylist: (window.QV_PAGE_SOUNDTRACK_PLAYLISTS || {})['pl-1791170281395'] || [],
      btnId: 'golden-y-hero-score',
      audioId: 'golden-y-hero-audio',
      label: 'Cool Jazz soundtrack',
      autoplay: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
