/**
 * Browser-tab favicon for Lattice Chat / Collaborate.
 * Idle: gold Φ on walnut. Unread DMs: red count badge (same signal as the title).
 */

export const LATTICE_FAVICON_HREF = '/interfaces/lattice-chat/favicon.svg';
const SIZE = 64;
const LINK_ATTR = 'data-lattice-tab-icon';

/** Badge text for the tab icon. Null means idle (no overlay). */
export function faviconBadgeLabel(unread: number): string | null {
  const n = Math.floor(Number(unread) || 0);
  if (n <= 0) return null;
  return n > 9 ? '9+' : String(n);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Draw the Lattice tab icon (optional unread badge) as a PNG data URL. */
export function drawLatticeFaviconDataUrl(unread = 0): string | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, SIZE, SIZE);
  roundedRect(ctx, 0, 0, SIZE, SIZE, 14);
  ctx.fillStyle = '#0a0806';
  ctx.fill();
  roundedRect(ctx, 2.5, 2.5, SIZE - 5, SIZE - 5, 12);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#d4af37';
  ctx.font = '700 36px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Φ', SIZE / 2, SIZE / 2 + 2);

  const label = faviconBadgeLabel(unread);
  if (label) {
    const badgeR = label.length > 1 ? 15 : 13;
    const cx = SIZE - badgeR - 2;
    const cy = SIZE - badgeR - 2;
    ctx.beginPath();
    ctx.arc(cx, cy, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0a0806';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${label.length > 1 ? 16 : 18}px "IBM Plex Sans", "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy + 0.5);
  }

  return canvas.toDataURL('image/png');
}

function setFaviconLink(href: string, type: string): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll(`link[${LINK_ATTR}]`).forEach((el) => el.remove());
  const link = document.createElement('link');
  link.setAttribute(LINK_ATTR, '1');
  link.rel = 'icon';
  link.type = type;
  link.href = href;
  document.head.appendChild(link);
}

/** Apply or clear the unread badge on the browser tab icon. */
export function applyTabFaviconBadge(unread: number): void {
  const label = faviconBadgeLabel(unread);
  if (!label) {
    setFaviconLink(LATTICE_FAVICON_HREF, 'image/svg+xml');
    return;
  }
  const href = drawLatticeFaviconDataUrl(unread);
  if (href) setFaviconLink(href, 'image/png');
}
