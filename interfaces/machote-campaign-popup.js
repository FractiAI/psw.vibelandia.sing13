/**
 * Machote members campaign modal — QUESTFEST top deck only (not Bulletin Board or Sovereign Player).
 */
(function () {
  'use strict';

  function isBulletinBoardPage() {
    var path = (window.location.pathname || '').toLowerCase();
    return path.includes('bulletin-board');
  }

  var SESSION_DISMISS_KEY = 'machote-campaign-dismissed-session-v8';
  var LEGACY_DISMISS_KEY = 'machote-members-campaign-dismissed-v2';
  var PASS_TOKEN_KEY = 'qv-pass-token';
  var LOCAL_HONOR_KEY = 'qv-local-monthly-honor';
  var CAPTAIN_KEY = 'qv-captain-unlocked';
  var BRIDGE_BOARDING =
    '/interfaces/questfest-bridge/?boarding=1#/listen';
  var BEEHIVE_PATH = '/interfaces/goldilocks-beehive-residency.html';
  var ROOM_SERVICE_PATH = '/hire-a-goldilocks-valet-concierge';

  function parsePassToken(token) {
    if (!token) return null;
    var parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      var pad = parts[1].length % 4 === 0 ? '' : '='.repeat(4 - (parts[1].length % 4));
      var json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/') + pad);
      var data = JSON.parse(json);
      if (data.tier !== 'PASSENGER') return null;
      if (typeof data.exp === 'number' && data.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function hasMembersAccess() {
    try {
      if (parsePassToken(localStorage.getItem(PASS_TOKEN_KEY))) return true;
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
      localStorage.removeItem(LEGACY_DISMISS_KEY);
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
    if (isDismissedThisSession()) return false;
    return true;
  }

  function applyMemberState(root) {
    if (!hasMembersAccess()) return;
    root.classList.add('machote-campaign--member');
  }

  function init() {
    if (isBulletinBoardPage()) return;
    var root = document.getElementById('machote-campaign-modal');
    if (!root) return;

    var forceCampaign = consumeCampaignResetFromUrl();

    var backdrop = root.querySelector('[data-machote-dismiss]');
    var closeBtn = root.querySelector('.machote-campaign-close');
    var laterBtn = root.querySelector('[data-machote-later]');

    function closeModal(dismissPersist) {
      if (dismissPersist) dismiss();
      root.classList.remove('machote-campaign-open');
      root.hidden = true;
      root.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openModal() {
      applyMemberState(root);
      root.removeAttribute('hidden');
      root.classList.add('machote-campaign-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var focusTarget = root.querySelector('.machote-campaign-close') ||
        root.querySelector('[data-machote-later]') ||
        root.querySelector('.machote-campaign-dual-nav__btn--hire');
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

    /* Do not wait for window load — hero images can delay or block it forever */
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(maybeOpen, 80);
      });
    } else {
      setTimeout(maybeOpen, 80);
    }
  }

  window.MachoteCampaignPopup = {
    init: init,
    open: function () {
      var root = document.getElementById('machote-campaign-modal');
      if (root) {
        root.removeAttribute('hidden');
        root.classList.add('machote-campaign-open');
        root.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    },
    BRIDGE_BOARDING: BRIDGE_BOARDING,
    BEEHIVE_PATH: BEEHIVE_PATH,
    ROOM_SERVICE_PATH: ROOM_SERVICE_PATH
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
