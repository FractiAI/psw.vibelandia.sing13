/**
 * Vibelandia static + live i18n.
 * - Dictionary merge for data-i18n* (en.json + locale overlays)
 * - Live surface/paper translation when locale ≠ en (browser Translator API, else /api/i18n-translate)
 * - Language bar: ?lang= · localStorage · browser autosense
 */
(function () {
  'use strict';

  /** Temporary kill switch — live translation + locale autosense (Player 1 · Sep 2026). */
  var I18N_LIVE_DISABLED = true;
  var BOOT_SCRIPT = document.currentScript;
  var BOOT_PAGE_ATTR =
    (BOOT_SCRIPT && BOOT_SCRIPT.getAttribute('data-page')) || '';

  if (I18N_LIVE_DISABLED) {
    window.__VIBELANDIA_I18N_LIVE_DISABLED__ = true;
    document.documentElement.classList.remove('vbi18n-pending');
    document.documentElement.classList.add('vbi18n-ready');
    var disabledPage = BOOT_PAGE_ATTR || '';
    if (!disabledPage || disabledPage === 'auto') {
      disabledPage = (function () {
        var p = (window.location.pathname || '').toLowerCase();
        if (p.indexOf('vibelandia-questfest') !== -1 || p === '/' || p === '/questfest' || p === '/questfest/') {
          return 'questfest';
        }
        if (p.indexOf('whitepaper') !== -1 || p.indexOf('/papers') !== -1 || p.indexOf('/read') !== -1) {
          return 'papers';
        }
        return 'surface';
      })();
    }
    window.__VIBELANDIA_I18N__ = {
      locale: 'en',
      requested: 'en',
      page: disabledPage,
      liveTranslate: false,
      disabled: true
    };
    window.VibelandiaI18n = {
      getLocale: function () {
        return 'en';
      }
    };
    return;
  }

  var STORAGE_LOCALE = 'vibelandia_locale';
  var STORAGE_USER_PICKED = 'vibelandia_locale_user';
  var CACHE_PREFIX = 'vbi18n_tx_v1_';
  var I18N_BASE = '/interfaces/i18n/';
  var TRANSLATE_API = '/api/i18n-translate';

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

  var SKIP_TAGS = {
    SCRIPT: 1,
    STYLE: 1,
    NOSCRIPT: 1,
    CODE: 1,
    PRE: 1,
    KBD: 1,
    SAMP: 1,
    TEXTAREA: 1,
    OPTION: 1,
    SVG: 1,
    MATH: 1,
    INPUT: 1,
    SELECT: 1,
  };

  var state = {
    locale: 'en',
    requested: 'en',
    page: '',
    dict: null,
    translating: false
  };

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

  var REVEAL_FALLBACK_MS = 500;
  var FETCH_TIMEOUT_MS = 8000;
  var TRANSLATE_TIMEOUT_MS = 10000;
  var revealDone = false;

  function fetchJson(url, timeoutMs) {
    var limit = timeoutMs || FETCH_TIMEOUT_MS;
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('fetch_timeout'));
      }, limit);
      fetch(url, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(data);
        })
        .catch(function (err) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          reject(err);
        });
    });
  }

  function promiseWithTimeout(promise, timeoutMs, fallback) {
    return new Promise(function (resolve) {
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve(fallback);
      }, timeoutMs);
      Promise.resolve(promise)
        .then(function (value) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch(function () {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(fallback);
        });
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
    if (page === 'papers' || page === 'surface' || page === 'guide') return 'qf';
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
    if (
      p.indexOf('whitepaper') !== -1 ||
      p.indexOf('/papers') !== -1 ||
      p.indexOf('/read') !== -1
    ) {
      return 'papers';
    }
    if (
      p.indexOf('players-guide') !== -1 ||
      p.indexOf('goldilocks-players-guide') !== -1
    ) {
      return 'guide';
    }
    if (p.indexOf('ship-blog') !== -1 || p.indexOf('/blog-') !== -1) return 'surface';
    return 'surface';
  }

  function applyToDom(dict, page) {
    var root = pageI18nRoot(page);
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key || key.indexOf(root + '.') !== 0) return;
      var val = get(dict, key);
      if (val == null || val === '') return;
      el.textContent = val;
      el.setAttribute('data-vbi18n-dict', '1');
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (!key || key.indexOf(root + '.') !== 0) return;
      var val = get(dict, key);
      if (val == null || val === '') return;
      el.innerHTML = val;
      el.setAttribute('data-vbi18n-dict', '1');
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

  function shouldSkipText(text) {
    var t = String(text || '').trim();
    if (!t) return true;
    if (t.length < 2) return true;
    if (/^https?:\/\//i.test(t)) return true;
    if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(t)) return true;
    if (/^\/[\w./?#&=%-]*$/.test(t)) return true;
    if (/^[0-9\s.,:%°ΩφπΔ±×÷+\-/=$#]+$/u.test(t)) return true;
    return false;
  }

  function collectTextNodes(root) {
    var nodes = [];
    if (!root) return nodes;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node || !node.nodeValue || !String(node.nodeValue).trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS[p.tagName]) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest('#vbi18n-bar, [data-vbi18n-skip], .katex, mjx-container, code, pre')) {
          return NodeFilter.FILTER_REJECT;
        }
        if (p.getAttribute && p.getAttribute('data-vbi18n-dict') === '1') {
          return NodeFilter.FILTER_REJECT;
        }
        if (p.getAttribute && p.getAttribute('data-vbi18n-tx') === state.locale) {
          return NodeFilter.FILTER_REJECT;
        }
        if (shouldSkipText(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    return nodes;
  }

  function cacheKey(locale, text) {
    var h = 2166136261;
    var s = locale + '\0' + text;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return CACHE_PREFIX + locale + '_' + (h >>> 0).toString(36);
  }

  function cacheGet(locale, text) {
    try {
      return window.sessionStorage.getItem(cacheKey(locale, text));
    } catch (e) {
      return null;
    }
  }

  function cacheSet(locale, text, translated) {
    try {
      window.sessionStorage.setItem(cacheKey(locale, text), translated);
    } catch (e) {}
  }

  function bcp47ForTranslator(locale) {
    if (locale === 'zh') return 'zh-Hans';
    if (locale === 'zh-TW') return 'zh-Hant';
    return locale;
  }

  function getBrowserTranslator(targetLocale) {
    var api = window.Translator || (window.translation && window.translation.createTranslator);
    if (!window.Translator && !(window.translation && window.translation.createTranslator)) {
      return Promise.resolve(null);
    }
    var target = bcp47ForTranslator(targetLocale);
    try {
      if (window.Translator && typeof window.Translator.create === 'function') {
        return window.Translator.create({ sourceLanguage: 'en', targetLanguage: target });
      }
      if (window.translation && typeof window.translation.createTranslator === 'function') {
        return window.translation.createTranslator({
          sourceLanguage: 'en',
          targetLanguage: target
        });
      }
    } catch (e) {}
    return Promise.resolve(null);
  }

  function translateViaApi(texts, targetLocale) {
    return fetch(TRANSLATE_API, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ texts: texts, target: targetLocale, source: 'en' })
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || !data.ok || !Array.isArray(data.translations)) {
          throw new Error(data.code || data.message || 'translate_failed');
        }
        return data.translations;
      });
    });
  }

  function translateBatch(texts, targetLocale, translator) {
    if (translator && typeof translator.translate === 'function') {
      return Promise.all(
        texts.map(function (t) {
          return translator.translate(t).catch(function () {
            return t;
          });
        })
      );
    }
    // API batches of ≤40
    var out = [];
    var chain = Promise.resolve();
    for (var i = 0; i < texts.length; i += 40) {
      (function (slice, offset) {
        chain = chain.then(function () {
          return translateViaApi(slice, targetLocale).then(function (parts) {
            for (var j = 0; j < parts.length; j++) out[offset + j] = parts[j];
          });
        });
      })(texts.slice(i, i + 40), i);
    }
    return chain.then(function () {
      return out;
    });
  }

  function setStatusHint(msg) {
    var el = document.getElementById('vbi18n-status');
    if (el) el.textContent = msg || '';
  }

  /**
   * Live-translate text nodes under root into state.locale.
   * @param {Element} [root]
   * @returns {Promise<void>}
   */
  function translateRoot(root) {
    if (!state.locale || state.locale === 'en') return Promise.resolve();
    var scope = root || document.body;
    if (!scope) return Promise.resolve();

    var nodes = collectTextNodes(scope);
    if (!nodes.length) return Promise.resolve();

    var pending = [];
    var pendingNodes = [];
    nodes.forEach(function (node) {
      var original = node.nodeValue;
      var trimmed = original.replace(/^\s+|\s+$/g, '');
      var lead = original.match(/^\s*/)[0];
      var trail = original.match(/\s*$/)[0];
      var cached = cacheGet(state.locale, trimmed);
      if (cached != null) {
        node.nodeValue = lead + cached + trail;
        if (node.parentElement) node.parentElement.setAttribute('data-vbi18n-tx', state.locale);
        return;
      }
      pending.push(trimmed);
      pendingNodes.push({ node: node, lead: lead, trail: trail, trimmed: trimmed });
    });

    if (!pending.length) return Promise.resolve();

    state.translating = true;
    setStatusHint('Translating surface…');

    return promiseWithTimeout(getBrowserTranslator(state.locale), TRANSLATE_TIMEOUT_MS, null)
      .then(function (translator) {
        return promiseWithTimeout(
          translateBatch(pending, state.locale, translator),
          TRANSLATE_TIMEOUT_MS,
          pending
        );
      })
      .then(function (translated) {
        for (var i = 0; i < pendingNodes.length; i++) {
          var item = pendingNodes[i];
          var tx = translated[i] != null ? String(translated[i]) : item.trimmed;
          cacheSet(state.locale, item.trimmed, tx);
          item.node.nodeValue = item.lead + tx + item.trail;
          if (item.node.parentElement) {
            item.node.parentElement.setAttribute('data-vbi18n-tx', state.locale);
          }
        }
        setStatusHint('Machine-translated · English source remains canonical');
      })
      .catch(function (err) {
        console.warn('i18n-auto: surface translate failed', err);
        setStatusHint('Translation unavailable — showing English');
      })
      .then(function () {
        state.translating = false;
      });
  }

  function watchDynamicContent() {
    if (!state.locale || state.locale === 'en' || !document.body) return;
    var timer = null;
    var obs = new MutationObserver(function () {
      if (state.translating) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        translateRoot(document.body);
      }, 280);
    });
    obs.observe(document.body, { childList: true, subtree: true });
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
    var status = document.createElement('span');
    status.id = 'vbi18n-status';
    status.style.cssText = 'opacity:.9;max-width:52ch;text-align:center;';
    if (hint) status.textContent = hint;
    bar.appendChild(status);
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
    if (revealDone) return;
    revealDone = true;
    document.documentElement.classList.remove('vbi18n-pending');
    document.documentElement.classList.add('vbi18n-ready');
  }

  function scheduleRevealFallback() {
    window.setTimeout(function () {
      revealDocument();
    }, REVEAL_FALLBACK_MS);
  }

  function initFromPage(page) {
    if (!page) page = 'surface';
    state.page = page;
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
        try {
          var dict = res.dict;
          var eff = res.effective;
          var req = res.requested;
          state.dict = dict;
          state.locale = eff;
          state.requested = req;
          setDocumentLocale(eff);
          applyToDom(dict, page);
          injectLangBar(eff, req, dict, page);
          var skipLiveTranslate = page === 'papers';
          window.__VIBELANDIA_I18N__ = {
            locale: eff,
            requested: req,
            page: page,
            userPicked: userPickedLocale(),
            browserLanguages: browserCandidates(),
            liveTranslate: eff !== 'en' && !skipLiveTranslate
          };
          revealDocument();
          if (eff !== 'en' && !skipLiveTranslate) {
            translateRoot(document.body).then(function () {
              watchDynamicContent();
            });
          }
        } catch (err) {
          console.warn('i18n-auto: apply failed', err);
          revealDocument();
        }
      })
      .catch(function () {
        revealDocument();
        console.warn('i18n-auto: failed to load en.json');
      });
  }

  function bootDisabledEnglishOnly(page) {
    revealDocument();
    state.page = page || 'surface';
    state.locale = 'en';
    state.requested = 'en';
    window.__VIBELANDIA_I18N__ = {
      locale: 'en',
      requested: 'en',
      page: state.page,
      userPicked: false,
      browserLanguages: browserCandidates(),
      liveTranslate: false,
      disabled: true
    };
  }

  function boot() {
    var page = BOOT_PAGE_ATTR || '';
    if (!page || page === 'auto') {
      page = detectPageFromPath() || 'surface';
    }
    if (I18N_LIVE_DISABLED) {
      bootDisabledEnglishOnly(page);
      return;
    }
    if (typeof window.__vbi18nFailOpenReveal === 'function') {
      window.__vbi18nFailOpenReveal();
    }
    revealDocument();
    scheduleRevealFallback();
    initFromPage(page);
  }

  window.VibelandiaI18n = {
    initFromPage: initFromPage,
    normalizeTag: normalizeTag,
    detectPageFromPath: detectPageFromPath,
    browserCandidates: browserCandidates,
    translateRoot: translateRoot,
    getLocale: function () {
      return state.locale;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
