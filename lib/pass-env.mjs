/**
 * Shared copy for operators when PASS_TOKEN_SECRET is missing on the host.
 */
export const PASS_TOKEN_SECRET_SETUP_MESSAGE =
  'Pass tokens cannot be signed: set environment variable PASS_TOKEN_SECRET to at least 16 random characters ' +
  '(for example `openssl rand -hex 32`). On Vercel: Project → Settings → Environment Variables → add PASS_TOKEN_SECRET for Production, ' +
  'then trigger a new deployment so the variable is available to serverless functions.';

export function getPassTokenSecret() {
  const s = process.env.PASS_TOKEN_SECRET;
  if (!s || String(s).trim().length < 16) return null;
  return String(s).trim();
}
