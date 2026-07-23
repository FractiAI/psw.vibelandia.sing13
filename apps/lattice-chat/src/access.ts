/** Public contact / creator — never put API keys in the Vite bundle. */
export const CREATOR_EMAIL = 'valetpru@gmail.com';

export const LATTICE_ACCESS_EMAIL =
  (import.meta.env.VITE_LATTICE_ACCESS_EMAIL as string | undefined)?.trim() ||
  CREATOR_EMAIL;

export const LATTICE_ACCESS_MAILTO = `mailto:${LATTICE_ACCESS_EMAIL}?subject=${encodeURIComponent(
  'Lattice V1.618 — free trial',
)}&body=${encodeURIComponent(
  'Hello,\n\nI would like a free trial of Lattice V1.618 on SS Vibelandia.\n\nMy email / userid: \n\nThanks.',
)}`;

export const LATTICE_FREE_TRIAL_MAILTO = LATTICE_ACCESS_MAILTO;

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizeEmail(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function isValidEmailShape(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isCreatorEmail(email: string): boolean {
  return normalizeEmail(email) === normalizeEmail(CREATOR_EMAIL);
}

/** Edge remember: creator never expires; guests re-prompt after 30 days on-device. */
export function isRememberedEmailFresh(
  email: string,
  rememberedAt: string | null | undefined,
): boolean {
  const e = normalizeEmail(email);
  if (!e || !isValidEmailShape(e)) return false;
  if (isCreatorEmail(e)) return true;
  if (!rememberedAt) return false;
  const t = new Date(rememberedAt).getTime();
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < MONTH_MS;
}
