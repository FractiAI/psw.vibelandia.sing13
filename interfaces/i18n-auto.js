/**
 * Vibelandia static i18n: browser language autosense, ?lang= override, explicit user pick.
 * Loads interfaces/i18n/en.json plus best-match locale file and deep-merges.
 */
(function () {
  'use strict';

  var STORAGE_LOCALE = 'vibelandia_locale';
  var STORAGE_USER_PICKED = 'vibelandia_locale_user';
  var I18N_BASE = '/interfaces/i18n/';

  /** Shipped full locales (must match en.json __locales__). */
  var SHIPPED_LOCALES = {
    en: true,
    es: true,
    fr: true,
    de: true,
    pt: true,
    zh: true,
    'zh-TW': true,
    ja: true,
    ko: true,
    ar: true
  };

  var RTL_PREFIXES = ['ar', 'fa', 'ur', 'he', 'iw', 'yi', 'dv', 'ps', 'sd'];

  function normalizeTag(tag) {
    if (!tag || typeof tag !== 'string') return '';
    var t = tag.trim().replace('_', '-');
    if (!t) return '';
    var lower = t.toLowerCase();
    var map = {
      'zh-cn': 'zh',
      'zh-sg': 'zh',
      'zh-tw': 'zh-TW',
      'zh-hk': 'zh-TW',
      'zh-mo': 'zh-TW',
      'pt-br': 'pt',
      'pt-pt': 'pt',
      iw: 'he',
      in: 'id'
    };
    if (map[lower]) return map[lower];
    var parts = t.split('-');
    if (parts.length === 1) return parts[0].toLowerCase();
    return parts[0].toLowerCase() + '-' + parts.slice(1).join('-');
  }

  function isRtlLocale(tag) {
    var base = (tag || '').split('-')[0].toLowerCase();
    return RTL_PREFIXES.indexOf(base) !== -1;
  }

  function isShipped(code, available) {
    if (!code || code === 'en') return true;
    if (available && available[code]) return true;
    return !!SHIPPED_LOCALES[code];
  }

  function deepMerge(base, extra) {
    if (!extra || typeof extra !== 'object') return base;
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(extra).forEach(function (k) {
      if (k === '__locales__') return;
      var ev = extra[k];
      var bv = out[k];
      if (
        ev &&
        typeof ev === 'object' &&
        !Array.isArray(ev) &&
        bv &&
        typeof bv === 'object' &&
        !Array.isArray(bv)
      ) {
        out[k] = deepMerge(bv, ev);
      } else {
        out[k] = ev;
      }
    });
    return out;
  }

  function get(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce(function (o, k) {
      return o == null ? o : o[k];
    }, obj);
  }

  function queryParamLang() {
    try {
      var q = new URLSearchParams(window.location.search).get('lang');
      return q ? normalizeTag(q) : '';
    } catch (e) {
      return '';
    }
  }

  function storedLocale() {
    try {
      return normalizeTag(window.localStorage.getItem(STORAGE_LOCALE) || '');
    } catch (e) {
      return '';
    }
  }

  function userPickedLocale() {
    try {
      return window.localStorage.getItem(STORAGE_USER_PICKED) === '1';
    } catch (e) {
      return false;
    }
  }

  function storedUserLang() {
    if (!userPickedLocale()) return '';
    return storedLocale();
  }

  function persistAutosenseLocale(code) {
    if (!code || code === 'en') return;
    try {
      window.localStorage.setItem(STORAGE_LOCALE, code);
      window.localStorage.removeItem(STORAGE_USER_PICKED);
    } catch (e) {}
  }

  function markUserLocale(code) {
    try {
      window.localStorage.setItem(STORAGE_LOCALE, code);
      window.localStorage.setItem(STORAGE_USER_PICKED, '1');
    } catch (e) {}
  }

  function browserCandidates() {
    var nav = window.navigator || {};
    var list = [];
    if (Array.isArray(nav.languages) && nav.languages.length) {
      list = nav.languages.slice();
    } else if (nav.language) {
      list = [nav.language];
    } else if (nav.userLanguage) {
      list = [nav.userLanguage];
    }
    return list.map(normalizeTag).filter(Boolean);
  }

  function candidateFilesForTag(tag) {
    var out = [];
    if (!tag) return out;
    out.push(tag);
    var i = tag.indexOf('-');
    if (i > 0) out.push(tag.slice(0, i));
    return out.filter(function (v, idx, a) {
      return v && a.indexOf(v) === idx;
    });
  }

  function resolveRequestedLocale(available) {
    var fromQ = queryParamLang();
    if (fromQ) return fromQ;

    var fromUser = storedUserLang();
    if (fromUser && isShipped(fromUser, available)) return fromUser;

    var cands = browserCandidates();
    for (var i = 0; i < cands.length; i++) {
      var files = candidateFilesForTag(cands[i]);
      for (var j = 0; j < files.length; j++) {
        var f = files[j];
        if (isShipped(f, available)) {
          persistAutosenseLocale(f);
          return f;
        }
      }
    }

    var remembered = storedLocale();
    if (!userPickedLocale() && remembered && isShipped(remembered, available)) {
      return remembered;
    }

    return 'en';
  }

  function fetchJson(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function pickLocaleFile(requested, availableFromEn) {
    var files = candidateFilesForTag(requested);
    for (var i = 0; i < files.length; i++) {
      if (files[i] === 'en') return 'en';
    }
    for (var j = 0; j < files.length; j++) {
      if (files[j] && (availableFromEn[files[j]] || SHIPPED_LOCALES[files[j]])) return files[j];
    }
    return 'en';
  }

  function pageI18nRoot(page) {
    if (page === 'hood') return 'hood';
    if (page === 'fractai') return 'fractai';
    if (page === 'glos') return 'glos';
    return 'qf';
  }

  function detectPageFromPath() {
    var p = (window.location.pathname || '').toLowerCase();
    if (
      p.indexOf('goldilocks-os') !== -1 ||
      p.indexOf('holographic-goldilocks') !== -1 ||
      p.indexOf('holographic-panama-canal') !== -1 ||
      p.indexOf('panama-canal') !== -1 ||
      p === '/portal' ||
      p === '/portal/' ||
      p.indexOf('/other-side') === 0
    ) {
      return 'glos';
    }
    if (p.indexOf('look-under-the-hood') !== -1 || p.indexOf('/hood') !== -1) return 'hood';
    if (p.indexOf('fractiai') !== -1 && p.indexOf('digital-pru') === -1) return 'fractai';
    if (p.indexOf('vibelandia-questfest') !== -1 || p === '/' || p === '/questfest' || p === '/questfest/') {
      return 'questfest';
    }
    return '';
  }

  function applyToDom(dict, page) {
    var root = pageI18nRoot(page);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key || key.indexOf(root + '.') !== 0) return;
      var val = get(dict, key);
      if (val == null || val === '') return;
      el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (!key || key.indexOf(root + '.') !== 0) return;
      var val = get(dict, key);
      if (val == null || val === '') return;
      el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      if (!spec) return;
      var parts = spec.split('|');
      for (var i = 0; i < parts.length; i++) {
        var pair = parts[i].split(':');
        if (pair.length !== 2) continue;
        var attr = pair[0].trim();
        var key = pair[1].trim();
        if (key.indexOf(root + '.') !== 0) continue;
        var val = get(dict, key);
        if (val == null || val === '') continue;
        el.setAttribute(attr, val);
      }
    });

    var titleKey = root + '.meta.title';
    var t = get(dict, titleKey);
    if (t) document.title = t;

    function setMeta(sel, key) {
      var k = root + '.meta.' + key;
      var v = get(dict, k);
      if (!v) return;
      var m = document.querySelector(sel);
      if (m) m.setAttribute('content', v);
    }
    setMeta('meta[name="description"]', 'desc');
    setMeta('meta[property="og:title"]', 'ogTitle');
    setMeta('meta[property="og:description"]', 'ogDesc');
    setMeta('meta[name="twitter:title"]', 'ogTitle');
    setMeta('meta[name="twitter:description"]', 'ogDesc');
  }

  function injectLangBar(effectiveLocale, requestedLocale, dict, page) {
    if (document.getElementById('vbi18n-bar')) return;
    var root = pageI18nRoot(page);
    var labelKey = root + '.langBar.label';
    var partialKey = root + '.langBar.partialFallback';
    var autosenseKey = root + '.langBar.autosensed';
    var label = get(dict, labelKey) || 'Language';
    var hint = '';
    if (effectiveLocale === 'en' && requestedLocale !== 'en' && !isShipped(requestedLocale, dict.__locales__)) {
      hint = get(dict, partialKey) || '';
    } else if (effectiveLocale !== 'en' && !userPickedLocale()) {
      hint = get(dict, autosenseKey) || '';
    }
    var bar = document.createElement('div');
    bar.id = 'vbi18n-bar';
    bar.setAttribute(
      'style',
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:.45rem .65rem;font-size:.72rem;' +
        'background:rgba(6,8,13,.92);border-top:1px solid rgba(212,175,55,.35);color:#94a3b8;' +
        'display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;justify-content:center;'
    );
    var span = document.createElement('span');
    span.textContent = label + ': ';
    span.style.color = '#e2e8f0';
    var sel = document.createElement('select');
    sel.setAttribute('aria-label', label);
    sel.style.cssText =
      'background:#0f141c;color:#fef3c7;border:1px solid rgba(212,175,55,.4);border-radius:4px;padding:.25rem .4rem;font-size:.72rem;max-width:min(280px,90vw);';

    var available = dict.__locales__ || SHIPPED_LOCALES;
    var codes = Object.keys(available).filter(function (c) {
      return c !== 'en' && available[c];
    });
    codes.sort();
    codes.unshift('en');

    var dn = null;
    try {
      dn = new Intl.DisplayNames([effectiveLocale, 'en'], { type: 'language' });
    } catch (e1) {}

    function optionLabel(code) {
      if (code === 'zh') return '中文 (简体)';
      if (code === 'zh-TW') return '中文 (繁體)';
      if (code === 'pt') return 'Português';
      if (code === 'es') return 'Español';
      if (code === 'fr') return 'Français';
      if (code === 'de') return 'Deutsch';
      if (code === 'ja') return '日本語';
      if (code === 'ko') return '한국어';
      if (code === 'ar') return 'العربية';
      if (dn) {
        try {
          var base = code.split('-')[0];
          return dn.of(base) + ' (' + code + ')';
        } catch (e2) {}
      }
      return code;
    }

    codes.forEach(function (code) {
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = optionLabel(code);
      if (code === effectiveLocale) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.addEventListener('change', function () {
      markUserLocale(sel.value);
      var url = new URL(window.location.href);
      url.searchParams.set('lang', sel.value);
      window.location.href = url.toString();
    });

    bar.appendChild(span);
    bar.appendChild(sel);
    if (hint) {
      var h = document.createElement('span');
      h.style.cssText = 'opacity:.85;max-width:48ch;text-align:center;';
      h.textContent = hint;
      bar.appendChild(h);
    }
    document.body.appendChild(bar);
    document.body.style.paddingBottom = '3.25rem';
  }

  function setDocumentLocale(effective) {
    var html = document.documentElement;
    if (effective === 'zh') html.setAttribute('lang', 'zh-Hans');
    else if (effective === 'zh-TW') html.setAttribute('lang', 'zh-Hant');
    else if (effective === 'ar') html.setAttribute('lang', 'ar');
    else html.setAttribute('lang', effective);
    if (isRtlLocale(effective)) html.setAttribute('dir', 'rtl');
    else html.setAttribute('dir', 'ltr');
  }

  function revealDocument() {
    document.documentElement.classList.remove('vbi18n-pending');
    document.documentElement.classList.add('vbi18n-ready');
  }

  function initFromPage(page) {
    if (!page) return;
    var baseUrl = I18N_BASE + 'en.json';

    fetchJson(baseUrl)
      .then(function (en) {
        var available = en.__locales__ || SHIPPED_LOCALES;
        var requested = resolveRequestedLocale(available);
        var effective = pickLocaleFile(requested, available);
        if (effective === 'en') {
          return { dict: en, effective: 'en', requested: requested };
        }
        return fetchJson(I18N_BASE + effective + '.json')
          .then(function (loc) {
            return { dict: deepMerge(en, loc), effective: effective, requested: requested };
          })
          .catch(function () {
            return { dict: en, effective: 'en', requested: requested };
          });
      })
      .then(function (res) {
        var dict = res.dict;
        var eff = res.effective;
        var req = res.requested;
        setDocumentLocale(eff);
        applyToDom(dict, page);
        injectLangBar(eff, req, dict, page);
        revealDocument();
        window.__VIBELANDIA_I18N__ = {
          locale: eff,
          requested: req,
          page: page,
          userPicked: userPickedLocale(),
          browserLanguages: browserCandidates()
        };
      })
      .catch(function () {
        revealDocument();
        console.warn('i18n-auto: failed to load en.json');
      });
  }

  function boot() {
    var script = document.currentScript;
    var page = (script && script.getAttribute('data-page')) || '';
    if (!page || page === 'auto') {
      page = detectPageFromPath();
    }
    if (page === 'questfest') initFromPage('questfest');
    else if (page) initFromPage(page);
  }

  window.VibelandiaI18n = {
    initFromPage: initFromPage,
    normalizeTag: normalizeTag,
    detectPageFromPath: detectPageFromPath,
    browserCandidates: browserCandidates
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
