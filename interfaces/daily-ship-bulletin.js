/**
 * Client: always show the guest’s local calendar date on the QUESTFEST board,
 * then refresh Valet Pru’s news body from /api/daily-ship-bulletin.
 * Also paints Omniversal Canvas `#canvas-news-list` when present (newest first).
 * Dates are never left to baked HTML or i18n dictionaries.
 */
(function () {
  var MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  var WEEKDAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  function localBoard(now) {
    var d = now || new Date();
    var weekday = WEEKDAYS[d.getDay()];
    var month = MONTHS[d.getMonth()];
    var day = d.getDate();
    return {
      shortBoard: weekday + ' board · ' + month + ' ' + day + ' · Puerto Reno',
      newsLabel: 'News of the day · ' + weekday + ', ' + month + ' ' + day,
      titleLabel: weekday + ', ' + month + ' ' + day,
      canvasLabel: 'Latest · ' + weekday + ', ' + month + ' ' + day,
    };
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, '&#39;');
  }

  function paintToday() {
    var board = localBoard();
    var badgeEl = document.getElementById('qf-cloud-badge') || document.querySelector('.cloud-badge');
    var labelEl = document.getElementById('host-news-label');
    var canvasLabel = document.getElementById('canvas-news-label');
    if (badgeEl) badgeEl.textContent = board.shortBoard;
    if (labelEl) labelEl.textContent = board.newsLabel;
    if (canvasLabel) canvasLabel.textContent = board.canvasLabel;
    try {
      if (labelEl || badgeEl) {
        document.title = 'SS Vibelandia · Daily Ship Bulletin · ' + board.titleLabel;
      }
    } catch (_) {}
    return board;
  }

  function paintCanvasNews(highlights, dateYmd) {
    var list = document.getElementById('canvas-news-list');
    if (!list || !highlights || !highlights.length) return;
    var html = highlights
      .slice(0, 3)
      .map(function (h) {
        return (
          '<li><a href="' +
          escapeAttr(h.href) +
          '">' +
          '<p class="ship-news-date">' +
          escapeHtml(dateYmd || '') +
          '</p>' +
          '<p class="ship-news-title">' +
          escapeHtml(h.title) +
          '</p>' +
          '<p class="ship-news-blurb">' +
          escapeHtml(h.blurb) +
          '</p>' +
          '</a></li>'
        );
      })
      .join('');
    list.innerHTML = html;
  }

  paintToday();
  var bodyEl = document.getElementById('host-news-body');
  var canvasList = document.getElementById('canvas-news-list');
  if (!bodyEl && !canvasList) return;

  fetch('/api/daily-ship-bulletin', { credentials: 'omit' })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      if (!data || !data.ok) return;
      if (bodyEl && data.htmlBody) bodyEl.innerHTML = data.htmlBody;
      if (canvasList && data.highlights) {
        paintCanvasNews(data.highlights, data.date);
      }
      paintToday();
    })
    .catch(function () {
      paintToday();
    });
})();
