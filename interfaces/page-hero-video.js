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

  function embedSrc(id, origin, startSec) {
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
    if (startSec) q.push('start=' + startSec);
    if (origin) q.push('origin=' + encodeURIComponent(origin));
    return 'https://www.youtube-nocookie.com/embed/' + id + '?' + q.join('&');
  }

  function boot() {
    if (prefersReducedMotion()) return;
    var origin = typeof location !== 'undefined' ? location.origin : '';
    document.querySelectorAll('.ep-hero__video-embed[data-youtube-id], .rr-prelude__video[data-youtube-id]').forEach(function (el) {
      if (el.getAttribute('src')) return;
      var id = el.getAttribute('data-youtube-id');
      if (!id) return;
      var start = el.getAttribute('data-youtube-start');
      el.setAttribute('src', embedSrc(id, origin, start));
      el.setAttribute('loading', 'eager');
      el.setAttribute('title', '');
      el.classList.remove('ep-hero__video-embed--loading');
      el.classList.remove('rr-prelude__video--loading');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
