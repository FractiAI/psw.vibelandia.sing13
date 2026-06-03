/** QUESTFEST schedule item detail — loads /data/questfest-schedule-items.json */
(function () {
  'use strict';

  function slugFromPath() {
    const q = new URLSearchParams(window.location.search).get('slug');
    if (q) return q;
    const m = window.location.pathname.match(/\/questfest-schedule\/([^/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  async function load() {
    const slug = slugFromPath();
    const titleEl = document.getElementById('sched-title');
    if (!slug) {
      titleEl.textContent = 'Schedule item not found';
      return;
    }
    try {
      const res = await fetch('/data/questfest-schedule-items.json');
      const data = await res.json();
      const item = (data.items || []).find((i) => i.slug === slug);
      if (!item) {
        titleEl.textContent = 'Schedule item not found';
        document.getElementById('sched-summary').textContent =
          'No entry for slug: ' + slug + '. Return to the weekly schedule.';
        return;
      }
      document.title = item.title + ' · ' + item.day + ' · QUESTFEST';
      document.getElementById('sched-day').textContent = item.day;
      titleEl.textContent = item.title;
      document.getElementById('sched-nav-here').textContent = item.label;
      document.getElementById('sched-meta').innerHTML =
        '<strong>When:</strong> ' +
        esc(item.time) +
        ' · <strong>Where:</strong> ' +
        esc(item.zone);
      document.getElementById('sched-summary').textContent = item.summary;
      document.getElementById('sched-details').innerHTML = (item.details || [])
        .map((d) => '<li>' + esc(d) + '</li>')
        .join('');
      const rel = item.related || [];
      document.getElementById('sched-related').innerHTML = rel.length
        ? rel
            .map(
              (r) =>
                '<li><a href="' +
                esc(r.href) +
                '">' +
                esc(r.label) +
                '</a></li>'
            )
            .join('')
        : '<li><a href="/questfest-guide#page-4">Back to full schedule</a></li>';
    } catch (e) {
      titleEl.textContent = 'Could not load schedule';
      document.getElementById('sched-summary').textContent = String(e.message || e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
