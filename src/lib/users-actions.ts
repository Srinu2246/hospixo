'use server';

import { revalidatePath } from 'next/cache';

import { resendInvitation, sendInvitation } from '@/lib/api/invitations';
import { createUser, updateUser, updateUserStatus, replaceUserRoles } from '@/lib/api/users';
import { getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { routes } from '@/config/routes';
import { getServerToken } from '@/server/auth';
import { resolveOrgRoleCode } from '@/lib/resolve-org-role';
import { withCallerScope } from '@/lib/users-api-route';
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  AssignUserRolesInput,
  SendInvitationInput,
} from '@/types/users';

export type UsersActionResult = Readonly<{
  ok: boolean;
  message?: string;
  id?: string;
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

function revalidateEmployeeRoutes(userId?: string) {
  revalidatePath(routes.platform.usersRoles.root);
  revalidatePath(routes.platform.employees.organisation);
  revalidatePath(routes.platform.employees.company);
  revalidatePath(routes.platform.employees.branch);
  if (userId) {
    revalidatePath(`${routes.platform.usersRoles.editStaffPrefix}/${userId}`);
    revalidatePath(`${routes.platform.usersRoles.viewStaffPrefix}/${userId}`);
  }
}

/** POST create user with password (optional path). */
export async function createUserAction(input: CreateUserInput): Promise<UsersActionResult> {
  try {
    const token = await requireToken();
    const scoped = await withCallerScope({ ...input });
    const role_code = await resolveOrgRoleCode(token, String(scoped.role_code ?? input.role_code));
    const user = await createUser(token, { ...(scoped as CreateUserInput), role_code });
    revalidateEmployeeRoutes(String(user.id));
    return { ok: true, id: String(user.id) };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to create user.') };
  }
}

/** PUT update staff profile. */
export async function updateUserAction(
  userId: string,
  input: UpdateUserInput,
): Promise<UsersActionResult> {
  try {
    const token = await requireToken();
    await updateUser(token, userId, input);
    revalidateEmployeeRoutes(userId);
    return { ok: true, id: userId };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to update user.') };
  }
}

/** PATCH user status (active / disabled / invited). */
export async function updateUserStatusAction(
  userId: string,
  input: UpdateUserStatusInput,
): Promise<UsersActionResult> {
  try {
    const token = await requireToken();
    const status = input.status === 'disabled' ? 'inactive' : input.status;
    await updateUserStatus(token, userId, { status });
    revalidateEmployeeRoutes(userId);
    return { ok: true, id: userId };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to update status.') };
  }
}

/** PUT replace roles for a user. */
export async function replaceUserRolesAction(
  userId: string,
  input: AssignUserRolesInput,
): Promise<UsersActionResult> {
  try {
    const token = await requireToken();
    await replaceUserRoles(token, userId, input);
    revalidateEmployeeRoutes(userId);
    return { ok: true, id: userId };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to update roles.') };
  }
}

/** POST invitation from Create User. */
export async function sendInvitationAction(input: SendInvitationInput): Promise<UsersActionResult> {
  try {
    const token = await requireToken();
    const scoped = await withCallerScope({ ...input });
    const role_code = await resolveOrgRoleCode(token, String(scoped.role_code ?? input.role_code));
    const invitation = await sendInvitation(token, {
      ...(scoped as SendInvitationInput),
      role_code,
    });
    revalidateEmployeeRoutes();
    return { ok: true, id: String(invitation.id) };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to send invitation.') };
  }
}

export async function resendInvitationAction(invitationId: string): Promise<UsersActionResult> {
  try {
    const token = await requireToken();
    await resendInvitation(token, invitationId);
    revalidateEmployeeRoutes();
    return { ok: true, id: invitationId };
  } catch (error) {
    return { ok: false, message: toMessage(error, 'Unable to resend invitation.') };
  }
}
