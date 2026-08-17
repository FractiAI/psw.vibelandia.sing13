/**
 * Client: always show the guest’s local calendar date on the QUESTFEST board,
 * then refresh Valet Pru’s news body from /api/daily-ship-bulletin.
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
    };
  }

  function paintToday() {
    var board = localBoard();
    var badgeEl = document.getElementById('qf-cloud-badge') || document.querySelector('.cloud-badge');
    var labelEl = document.getElementById('host-news-label');
    if (badgeEl) badgeEl.textContent = board.shortBoard;
    if (labelEl) labelEl.textContent = board.newsLabel;
    try {
      document.title = 'SS Vibelandia · Daily Ship Bulletin · ' + board.titleLabel;
    } catch (_) {}
    return board;
  }

  paintToday();
  var bodyEl = document.getElementById('host-news-body');
  if (!bodyEl) return;

  fetch('/api/daily-ship-bulletin', { credentials: 'omit' })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      if (!data || !data.ok) return;
      if (data.htmlBody) bodyEl.innerHTML = data.htmlBody;
      paintToday();
    })
    .catch(function () {
      paintToday();
    });
})();
