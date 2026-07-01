/** QUESTFEST landing — share modal with QR code for the page URL. */
(function () {
  'use strict';

  var QR_SCRIPT = '/interfaces/scripts/vendor/qrcodejs-1.0.0.min.js';
  var qrLibPromise = null;
  var qrInstance = null;

  function shareUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) return canonical.href;
    return location.origin + location.pathname;
  }

  function loadQrLib() {
    if (typeof window.QRCode === 'function') return Promise.resolve();
    if (qrLibPromise) return qrLibPromise;
    qrLibPromise = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = QR_SCRIPT;
      s.async = true;
      s.onload = function () {
        if (typeof window.QRCode === 'function') resolve();
        else reject(new Error('qrcode_unavailable'));
      };
      s.onerror = function () {
        reject(new Error('qrcode_load_failed'));
      };
      document.head.appendChild(s);
    });
    return qrLibPromise;
  }

  function clearHost(host) {
    if (!host) return;
    if (qrInstance && typeof qrInstance.clear === 'function') {
      try {
        qrInstance.clear();
      } catch (_e) {
        /* ignore */
      }
    }
    qrInstance = null;
    host.innerHTML = '';
    host.removeAttribute('title');
  }

  function renderQr(host, url) {
    return loadQrLib().then(function () {
      clearHost(host);
      qrInstance = new window.QRCode(host, {
        text: url,
        width: 240,
        height: 240,
        colorDark: '#0a0806',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    });
  }

  function openModal(modal, opener) {
    var url = shareUrl();
    var urlEl = document.getElementById('qf-share-qr-url');
    var host = document.getElementById('qf-share-qr-host');
    var copyMsg = document.getElementById('qf-share-qr-copy-msg');
    var errEl = document.getElementById('qf-share-qr-error');

    if (urlEl) {
      urlEl.textContent = url;
      urlEl.setAttribute('title', url);
    }
    if (copyMsg) copyMsg.hidden = true;
    if (errEl) errEl.hidden = true;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('qf-share-qr-open');
    document.body.style.overflow = 'hidden';

    if (host) {
      clearHost(host);
      renderQr(host, url).catch(function () {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'QR could not load — copy the link below.';
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
    clearHost(document.getElementById('qf-share-qr-host'));
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
