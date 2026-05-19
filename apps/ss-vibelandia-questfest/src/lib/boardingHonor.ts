import type { LiveRail } from '@/lib/paymentRails';

/** Client-only Machote members pass — honor attestation stored on this device (no server JWT). */
export interface BoardingHonorPayload {
  rail: LiveRail;
  honorConfirm: true;
  paidDate: string;
  email: string;
}
