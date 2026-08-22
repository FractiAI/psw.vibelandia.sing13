/**
 * Guest-facing home label — SS VIBELANDIA (not QUESTFEST).
 * Routes stay / and /questfest; only display copy changes.
 */
export const SITE_HOME_LABEL = 'SS VIBELANDIA';
export const SITE_HOME_HREF = '/';

/** Replace guest-visible QUESTFEST home labels in HTML/nav strings. */
export function applySiteHomeLabel(html) {
  return html
    .replace(/>\s*QUESTFEST\s*<\//g, `>${SITE_HOME_LABEL}</`)
    .replace(/Back to QUESTFEST/g, `Back to ${SITE_HOME_LABEL}`)
    .replace(/Ship blog · QUESTFEST/g, 'Ship blog · SS Vibelandia')
    .replace(/· Ship blog · QUESTFEST/g, '· Ship blog · SS Vibelandia')
    .replace(/notes · QUESTFEST/g, 'notes · SS Vibelandia')
    .replace(/Every QUESTFEST ship-blog/g, 'Every SS Vibelandia ship-blog')
    .replace(/QUESTFEST main deck/g, `${SITE_HOME_LABEL} main deck`)
    .replace(/QUESTFEST voyage/g, `${SITE_HOME_LABEL} voyage`)
    .replace(/QUESTFEST home/g, `${SITE_HOME_LABEL} home`)
    .replace(/QUESTFEST · today/g, `${SITE_HOME_LABEL} · today`);
}
