/** Device-local forward address book — emails / phones stay on-device. */

export type ForwardRecipient = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
};

const STORAGE_KEY = 'qf-forward-recipients-v1';
const MAX_RECIPIENTS = 80;

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '').trim();
}

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function sanitizeRecipient(raw: unknown): ForwardRecipient | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id.trim() : '';
  const name = typeof o.name === 'string' ? o.name.trim() : '';
  const email = typeof o.email === 'string' ? normalizeEmail(o.email) : '';
  const phone = typeof o.phone === 'string' ? normalizePhone(o.phone) : '';
  if (!id || !name) return null;
  if (!email && !phone) return null;
  return {
    id,
    name,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  };
}

export function loadForwardRecipients(): ForwardRecipient[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: ForwardRecipient[] = [];
    const seen = new Set<string>();
    for (const item of parsed) {
      const rec = sanitizeRecipient(item);
      if (!rec || seen.has(rec.id)) continue;
      seen.add(rec.id);
      out.push(rec);
      if (out.length >= MAX_RECIPIENTS) break;
    }
    return out;
  } catch {
    return [];
  }
}

export function saveForwardRecipients(list: ForwardRecipient[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const cleaned = list
      .map((r) => sanitizeRecipient(r))
      .filter((r): r is ForwardRecipient => !!r)
      .slice(0, MAX_RECIPIENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    /* quota / private mode */
  }
}

export function createForwardRecipient(input: {
  name: string;
  email?: string;
  phone?: string;
}): ForwardRecipient | null {
  const name = input.name.trim();
  const email = input.email ? normalizeEmail(input.email) : '';
  const phone = input.phone ? normalizePhone(input.phone) : '';
  if (!name || (!email && !phone)) return null;
  return {
    id: `fwd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
  };
}

export function upsertForwardRecipient(
  list: ForwardRecipient[],
  recipient: ForwardRecipient,
): ForwardRecipient[] {
  const next = list.filter((r) => r.id !== recipient.id);
  next.unshift(recipient);
  return next.slice(0, MAX_RECIPIENTS);
}

export function removeForwardRecipient(list: ForwardRecipient[], id: string): ForwardRecipient[] {
  return list.filter((r) => r.id !== id);
}

export function recipientsWithEmail(list: ForwardRecipient[]): ForwardRecipient[] {
  return list.filter((r) => !!r.email);
}

export function recipientsWithPhone(list: ForwardRecipient[]): ForwardRecipient[] {
  return list.filter((r) => !!r.phone);
}
