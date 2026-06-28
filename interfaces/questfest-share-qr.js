/** QUESTFEST landing — share modal with QR code for the page URL. */
(function () {
  'use strict';

  var QR_SCRIPT = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js';
  var qrLibPromise = null;

  function shareUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) return canonical.href;
    return location.origin + location.pathname;
  }

  function loadQrLib() {
    if (window.QRCode) return Promise.resolve();
    if (qrLibPromise) return qrLibPromise;
    qrLibPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = QR_SCRIPT;
      s.async = true;
      s.onload = function () {
        if (window.QRCode) resolve();
        else reject(new Error('qrcode_unavailable'));
      };
      s.onerror = function () {
        reject(new Error('qrcode_load_failed'));
      };
      document.head.appendChild(s);
    });
    return qrLibPromise;
  }

  function renderQr(canvas, url) {
    return loadQrLib().then(function () {
      return window.QRCode.toCanvas(canvas, url, {
        width: 240,
        margin: 2,
        color: { dark: '#0a0806', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
    });
  }

  function openModal(modal, opener) {
    var url = shareUrl();
    var urlEl = document.getElementById('qf-share-qr-url');
    var canvas = document.getElementById('qf-share-qr-canvas');
    var copyMsg = document.getElementById('qf-share-qr-copy-msg');

    if (urlEl) {
      urlEl.textContent = url;
      urlEl.setAttribute('title', url);
    }
    if (copyMsg) copyMsg.hidden = true;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('qf-share-qr-open');
    document.body.style.overflow = 'hidden';

    if (canvas) {
      var ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderQr(canvas, url).catch(function () {
        if (urlEl) {
          urlEl.textContent = url + ' (QR unavailable — copy the link below)';
        }
      });
    }

    var closeBtn = modal.querySelector('.qf-share-qr-close');
    if (closeBtn) closeBtn.focus();
    modal._qfOpener = opener || null;
  }

  function closeModal(modal) {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('qf-share-qr-open');
    document.body.style.overflow = '';
    var opener = modal._qfOpener;
    if (opener && typeof opener.focus === 'function') opener.focus();
    modal._qfOpener = null;
  }

  function copyUrl(url, msgEl) {
    function done(ok) {
      if (!msgEl) return;
      msgEl.hidden = !ok;
      if (ok) {
        window.setTimeout(function () {
          msgEl.hidden = true;
        }, 2200);
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        done(true);
      }).catch(function () {
        done(fallbackCopy(url));
      });
      return;
    }
    done(fallbackCopy(url));
  }

  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_e) {
      return false;
    }
  }

  function init() {
    var openBtn = document.getElementById('qf-share-qr-open');
    var modal = document.getElementById('qf-share-qr-modal');
    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', function () {
      openModal(modal, openBtn);
    });

    modal.querySelectorAll('[data-qr-dismiss]').forEach(function (el) {
      el.addEventListener('click', function () {
        closeModal(modal);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal(modal);
    });

    var copyBtn = document.getElementById('qf-share-qr-copy');
    var copyMsg = document.getElementById('qf-share-qr-copy-msg');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        copyUrl(shareUrl(), copyMsg);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
