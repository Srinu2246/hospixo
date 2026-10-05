'use server';

import { revalidatePath } from 'next/cache';

import {
  acceptInvitation,
  cancelInvitation,
  rejectInvitation,
  resendInvitation,
  sendInvitation,
} from '@/lib/api/invitations';
import { routes } from '@/config/routes';
import { getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { getServerToken } from '@/server/auth';
import { resolveOrgRoleCode } from '@/lib/resolve-org-role';
import { withCallerScope } from '@/lib/users-api-route';
import type {
  AcceptInvitationInput,
  RejectInvitationInput,
  SendInvitationInput,
} from '@/types/users';

export type InvitationsActionResult = Readonly<{
  ok: boolean;
  message?: string;
  id?: string;
  status?: string;
  email?: string;
}>;

async function requireToken(): Promise<string> {
  const token = await getServerToken();
  if (!token) {
    throw new Error('Sign in required.');
  }
  return token;
}

function toMessage(error: unknown, fallback: string) {
  return getUserFriendlyErrorMessage(error, fallback);
}

function revalidateInvitationPaths(invitationId?: string) {
  revalidatePath(routes.platform.usersRoles.root);
  revalidatePath(routes.platform.employees.organisation);
  revalidatePath(routes.platform.employees.company);
  revalidatePath(routes.platform.employees.branch);
  revalidatePath(routes.platform.usersRoles.invitations);
  if (invitationId) {
    revalidatePath(`${routes.platform.usersRoles.invitations}/${invitationId}`);
  }
}

/** POST invitation (Add User review). */
export async function sendInvitationAction(
  input: SendInvitationInput,
): Promise<InvitationsActionResult> {
  try {
    const token = await requireToken();
    const scoped = await withCallerScope({ ...input });
    const role_code = await resolveOrgRoleCode(token, String(scoped.role_code ?? input.role_code));
    const invitation = await sendInvitation(token, {
      ...(scoped as SendInvitationInput),
      role_code,
    });
    revalidateInvitationPaths(String(invitation.id));
    return {
      ok: true,
      id: String(invitation.id),
      status: invitation.status,
      email: invitation.email,
    };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to send invitation.') };
  }
}

export async function resendInvitationAction(
  invitationId: string,
): Promise<InvitationsActionResult> {
  try {
    const token = await requireToken();
    const invitation = await resendInvitation(token, invitationId);
    revalidateInvitationPaths(invitationId);
    return {
      ok: true,
      id: invitationId,
      status: invitation.status,
      email: invitation.email,
    };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to resend invitation.') };
  }
}

export async function cancelInvitationAction(
  invitationId: string,
): Promise<InvitationsActionResult> {
  try {
    const token = await requireToken();
    const invitation = await cancelInvitation(token, invitationId);
    revalidateInvitationPaths(invitationId);
    return {
      ok: true,
      id: invitationId,
      status: invitation.status,
      email: invitation.email,
    };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to cancel invitation.') };
  }
}

/** Public accept (invite token in body; session cookie optional). */
export async function acceptInvitationAction(
  input: AcceptInvitationInput,
): Promise<InvitationsActionResult> {
  try {
    const sessionToken = await getServerToken();
    const invitation = await acceptInvitation(input, sessionToken);
    return {
      ok: true,
      id: String(invitation.id),
      status: invitation.status,
      email: invitation.email,
    };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to accept invitation.') };
  }
}

/** Public reject (invite token in body; session cookie optional). */
export async function rejectInvitationAction(
  input: RejectInvitationInput,
): Promise<InvitationsActionResult> {
  try {
    const sessionToken = await getServerToken();
    const invitation = await rejectInvitation(input, sessionToken);
    return {
      ok: true,
      id: String(invitation.id),
      status: invitation.status,
      email: invitation.email,
    };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to reject invitation.') };
  }
}
