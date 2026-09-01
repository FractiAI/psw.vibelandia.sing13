/**
 * Experience page hero · YouTube loop from data-youtube-id on .ep-hero__video-embed
 */
(function () {
  'use strict';

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {
      return false;
    }
  }

  function embedSrc(id, origin) {
    var q = [
      'autoplay=1',
      'mute=1',
      'playsinline=1',
      'loop=1',
      'playlist=' + id,
      'controls=0',
      'modestbranding=1',
      'rel=0',
      'enablejsapi=1',
      'iv_load_policy=3',
      'fs=0',
      'disablekb=1',
    ];
    if (origin) q.push('origin=' + encodeURIComponent(origin));
    return 'https://www.youtube-nocookie.com/embed/' + id + '?' + q.join('&');
  }

  function boot() {
    if (prefersReducedMotion()) return;
    var origin = typeof location !== 'undefined' ? location.origin : '';
    document.querySelectorAll('.ep-hero__video-embed[data-youtube-id]').forEach(function (el) {
      if (el.getAttribute('src')) return;
      var id = el.getAttribute('data-youtube-id');
      if (!id) return;
      el.setAttribute('src', embedSrc(id, origin));
      el.setAttribute('loading', 'eager');
      el.classList.remove('ep-hero__video-embed--loading');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
