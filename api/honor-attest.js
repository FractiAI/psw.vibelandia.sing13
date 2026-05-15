/**
 * Shared honor-system fields: user confirms they paid; we log date + email + rail (+ track for exports).
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parsePaidDateUtc(paidDate) {
  const d = new Date(`${paidDate}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {{ ok: true, paidDate: string, email: string } | { ok: false, status: number, code: string, message: string }}
 */
function validateHonorAttestation(body) {
  const honorConfirm = body.honorConfirm === true || body.honorConfirm === 'true';
  if (!honorConfirm) {
    return {
      ok: false,
      status: 400,
      code: 'honor_confirm_required',
      message: 'Check the box to confirm you completed payment (honor system).',
    };
  }

  const paidDate = String(body.paidDate || '').trim();
  const email = String(body.email || body.contact || '')
    .trim()
    .toLowerCase();

  if (!EMAIL_RE.test(email)) {
    return {
      ok: false,
      status: 400,
      code: 'email_invalid',
      message: 'Enter a valid email address.',
    };
  }

  const d = parsePaidDateUtc(paidDate);
  if (!d) {
    return {
      ok: false,
      status: 400,
      code: 'paid_date_invalid',
      message: 'Enter the date you paid (calendar format).',
    };
  }

  const endToday = new Date();
  endToday.setUTCHours(23, 59, 59, 999);
  if (d > endToday) {
    return {
      ok: false,
      status: 400,
      code: 'paid_date_future',
      message: 'Payment date cannot be in the future.',
    };
  }

  const min = new Date('2020-01-01T00:00:00.000Z');
  if (d < min) {
    return {
      ok: false,
      status: 400,
      code: 'paid_date_too_old',
      message: 'Pick a more recent payment date.',
    };
  }

  return { ok: true, paidDate, email };
}

module.exports = { validateHonorAttestation };
