/**
 * Machote members campaign modal — QUESTFEST top deck only (not Sovereign Player).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'machote-members-campaign-dismissed-v2';
  var PASS_TOKEN_KEY = 'qv-pass-token';
  var LOCAL_HONOR_KEY = 'qv-local-monthly-honor';
  var CAPTAIN_KEY = 'qv-captain-unlocked';
  var BRIDGE_BOARDING =
    '/interfaces/questfest-bridge/?boarding=1#/bridge';
  var BEEHIVE_PATH = '/interfaces/goldilocks-beehive-residency.html';

  function hasMembersAccess() {
    try {
      if (localStorage.getItem(PASS_TOKEN_KEY)) return true;
      if (sessionStorage.getItem(CAPTAIN_KEY) === '1') return true;
      var honor = localStorage.getItem(LOCAL_HONOR_KEY);
      if (!honor) return false;
      var o = JSON.parse(honor);
      if (!o || !o.validUntil) return false;
      var today = new Date().toISOString().slice(0, 10);
      return o.validUntil >= today;
    } catch (e) {
      return false;
    }
  }

  function isDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      /* ignore */
    }
  }

  function clearDismissed() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function consumeCampaignResetFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search);
      if (params.get('campaign') === '1') {
        clearDismissed();
        return true;
      }
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function shouldAutoShow() {
    if (hasMembersAccess()) return false;
    if (isDismissed()) return false;
    return true;
  }

  function whenI18nReady(cb) {
    if (window.__VIBELANDIA_I18N__) {
      cb();
      return;
    }
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (window.__VIBELANDIA_I18N__ || attempts > 80) {
        window.clearInterval(timer);
        cb();
      }
    }, 50);
  }

  function init() {
    var root = document.getElementById('machote-campaign-modal');
    if (!root) return;

    consumeCampaignResetFromUrl();

    var backdrop = root.querySelector('[data-machote-dismiss]');
    var closeBtn = root.querySelector('.machote-campaign-close');
    var laterBtn = root.querySelector('[data-machote-later]');

    function closeModal(dismissPersist) {
      if (dismissPersist) dismiss();
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openModal() {
      root.hidden = false;
      root.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var focusTarget = root.querySelector('.machote-campaign-btn--gold');
      if (focusTarget) focusTarget.focus();
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closeModal(true);
      });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        closeModal(true);
      });
    }
    if (laterBtn) {
      laterBtn.addEventListener('click', function () {
        closeModal(true);
      });
    }

    root.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') closeModal(true);
    });

    whenI18nReady(function () {
      if (shouldAutoShow()) openModal();
    });
  }

  window.MachoteCampaignPopup = {
    init: init,
    BRIDGE_BOARDING: BRIDGE_BOARDING,
    BEEHIVE_PATH: BEEHIVE_PATH
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
