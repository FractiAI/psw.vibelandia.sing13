/**
 * Machote members campaign modal — QUESTFEST top deck only (not Sovereign Player).
 */
(function () {
  'use strict';

  var SESSION_DISMISS_KEY = 'machote-campaign-dismissed-session-v3';
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

  function isDismissedThisSession() {
    try {
      return sessionStorage.getItem(SESSION_DISMISS_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, '1');
    } catch (e) {
      /* ignore */
    }
  }

  function clearDismissed() {
    try {
      sessionStorage.removeItem(SESSION_DISMISS_KEY);
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

  function shouldAutoShow(forceCampaign) {
    if (forceCampaign) return true;
    if (hasMembersAccess()) return false;
    if (isDismissedThisSession()) return false;
    return true;
  }

  function init() {
    var root = document.getElementById('machote-campaign-modal');
    if (!root) return;

    var forceCampaign = consumeCampaignResetFromUrl();

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

    function maybeOpen() {
      if (shouldAutoShow(forceCampaign)) openModal();
    }

    if (document.readyState === 'complete') {
      maybeOpen();
    } else {
      window.addEventListener('load', maybeOpen, { once: true });
    }
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
