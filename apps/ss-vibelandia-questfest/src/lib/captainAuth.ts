/**
 * Client-side captain / operator gate. Prefer setting VITE_CAPTAIN_BYPASS_PASSWORD in production
 * so the value is not baked into the bundle; if unset, a documented default is used for this edge.
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
