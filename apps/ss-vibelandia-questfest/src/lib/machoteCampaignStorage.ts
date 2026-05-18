import { MACHOTE_CAMPAIGN_STORAGE_KEY } from '@/lib/machoteMembership';

export function isMachoteCampaignDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MACHOTE_CAMPAIGN_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissMachoteCampaign(): void {
  try {
    localStorage.setItem(MACHOTE_CAMPAIGN_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearMachoteCampaignDismissed(): void {
  try {
    localStorage.removeItem(MACHOTE_CAMPAIGN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** `?campaign=1` on the QUESTFEST top deck URL clears dismiss and re-shows the offer. */
export function consumeCampaignResetFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('campaign') !== '1') return false;
  clearMachoteCampaignDismissed();
  return true;
}

export function shouldAutoShowMachoteCampaign(hasMembersAccess: boolean): boolean {
  if (hasMembersAccess) return false;
  if (isMachoteCampaignDismissed()) return false;
  return true;
}
