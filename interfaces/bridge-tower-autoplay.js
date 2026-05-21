/**
 * Bridge tower YouTube embed — set src after load so autoplay=1&mute=1 reliably fires.
 */
(function () {
  'use strict';

  var YOUTUBE_ID = 'IRgS6QcPK8o';

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
    ];
    if (origin) q.push('origin=' + encodeURIComponent(origin));
    return 'https://www.youtube.com/embed/' + YOUTUBE_ID + '?' + q.join('&');
  }

  function boot() {
    var origin = typeof location !== 'undefined' ? location.origin : '';
    var url = embedSrc(origin);
    document.querySelectorAll('.qf-bridge-tower__embed').forEach(function (el) {
      if (el.getAttribute('src')) return;
      el.setAttribute('src', url);
      el.setAttribute('loading', 'eager');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
