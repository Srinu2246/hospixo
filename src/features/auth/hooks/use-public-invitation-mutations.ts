'use client';

import { useMutation } from '@tanstack/react-query';

import {
  acceptInvitationViaBff,
  rejectInvitationViaBff,
} from '@/features/auth/api/public-invitations';
import type { AcceptInvitationInput, RejectInvitationInput } from '@/types/users';

export const publicInvitationMutationKeys = {
  accept: ['invitations', 'accept'] as const,
  reject: ['invitations', 'reject'] as const,
};

export function useAcceptInvitationMutation() {
  return useMutation({
    mutationKey: publicInvitationMutationKeys.accept,
    mutationFn: (input: AcceptInvitationInput) => acceptInvitationViaBff(input),
  });
}

export function useRejectInvitationMutation() {
  return useMutation({
    mutationKey: publicInvitationMutationKeys.reject,
    mutationFn: (input: RejectInvitationInput) => rejectInvitationViaBff(input),
  });
}
