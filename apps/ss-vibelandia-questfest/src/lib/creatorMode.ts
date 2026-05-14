const CREATOR_KEY = 'hjghf-is-creator';

export function markCreator(): void {
  try {
    localStorage.setItem(CREATOR_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isCreator(): boolean {
  try {
    return localStorage.getItem(CREATOR_KEY) === '1';
  } catch {
    return false;
  }
}
