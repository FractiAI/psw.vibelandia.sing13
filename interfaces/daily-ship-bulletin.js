/**
 * Client: refresh Valet Pru “News of the day” from /api/daily-ship-bulletin.
 * Keeps the Daily Ship Bulletin current without a redeploy when cron/API is live.
 */
(function () {
  var labelEl = document.getElementById('host-news-label');
  var bodyEl = document.getElementById('host-news-body');
  var badgeEl = document.querySelector('.cloud-badge');
  if (!labelEl && !bodyEl) return;

  fetch('/api/daily-ship-bulletin', { credentials: 'omit' })
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (data) {
      if (!data || !data.ok) return;
      if (labelEl && data.newsLabel) labelEl.textContent = data.newsLabel;
      if (bodyEl && data.htmlBody) bodyEl.innerHTML = data.htmlBody;
      if (badgeEl && data.cloudBadge) badgeEl.textContent = data.cloudBadge;
      try {
        document.title = 'SS Vibelandia · Daily Ship Bulletin · ' + (data.dateline && data.dateline.label ? data.dateline.label : 'Sonic Ship');
      } catch (_) {}
    })
    .catch(function () {
      /* static fallback already in HTML */
    });
})();
