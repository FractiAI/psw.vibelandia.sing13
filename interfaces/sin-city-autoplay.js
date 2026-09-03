/**
 * Sin City · Deck 3 Night soundtrack autoplays on /voyage/deck-3-night.
 * Unified page soundtrack with popup handoff on navigation.
 */
(function () {
  'use strict';

  function boot() {
    if (!window.QV_initPageSoundtrack) return;
    window.QV_initPageSoundtrack({
      pageId: 'sin-city',
      playlistId: 'pl-sin-city',
      staticPlaylist: (window.QV_PAGE_SOUNDTRACK_PLAYLISTS || {})['pl-sin-city'] || [],
      btnId: 'sin-city-hero-score',
      audioId: 'sin-city-hero-audio',
      label: 'Sin City soundtrack',
      autoplay: true,
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
