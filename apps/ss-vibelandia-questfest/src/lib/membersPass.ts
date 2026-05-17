import { isHonorDateActive, readLocalMonthlyHonor } from '@/lib/localMonthlyHonor';
import { parsePassPayload, readPassToken } from '@/lib/mockJwt';

/** True when an on-device honor pass or stored JWT pass is still valid. */
export function hasActiveMembersPass(): boolean {
  const lh = readLocalMonthlyHonor();
  if (lh && isHonorDateActive(lh.validUntil)) return true;
  return !!parsePassPayload(readPassToken());
}
