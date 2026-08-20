/**
 * Client-side Capitan / operator gate only.
 * Prefer VITE_CAPTAIN_BYPASS_PASSWORD in production so the value is not baked into the bundle;
 * if unset, a documented default is used for this edge.
 * Do NOT use this default to enable catalog upload / playlist sync — that path requires
 * VITE_CATALOG_UPLOAD_SECRET or VITE_CAPTAIN_BYPASS_PASSWORD set at build time
 * (see catalogUploadSecret in serverCatalog.ts).
 */
export function expectedCaptainPassword(): string {
  const fromEnv = import.meta.env.VITE_CAPTAIN_BYPASS_PASSWORD;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }
  return 'valetpru1!';
}

export function verifyCaptainPassword(input: string): boolean {
  const a = input.trim();
  const b = expectedCaptainPassword();
  return a.length > 0 && a === b;
}
