import { acceptInvitationRequest, rejectInvitationRequest } from '@/lib/users';
import type { AcceptInvitationInput, RejectInvitationInput } from '@/types/users';

export async function acceptInvitationViaBff(input: AcceptInvitationInput): Promise<void> {
  await acceptInvitationRequest(input);
}

export async function rejectInvitationViaBff(input: RejectInvitationInput): Promise<void> {
  await rejectInvitationRequest(input);
}
