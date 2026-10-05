'use server';

import { revalidatePath } from 'next/cache';

import { getUserFriendlyErrorMessage } from '@/lib/api/errors';
import { routes } from '@/config/routes';
import { createRoleOnServer } from '@/lib/roles-server';
import type { CreateRoleInput } from '@/types/roles';

export type RoleActionResult = Readonly<{
  ok: boolean;
  message?: string;
  roleCode?: string;
}>;

function revalidateRoleRoutes() {
  revalidatePath(routes.platform.usersRoles.root);
  revalidatePath(routes.platform.employees.organisation);
  revalidatePath(routes.platform.employees.company);
  revalidatePath(routes.platform.employees.branch);
}

export async function createRoleAction(input: CreateRoleInput): Promise<RoleActionResult> {
  try {
    const role = await createRoleOnServer(input);
    revalidateRoleRoutes();
    return {
      ok: true,
      roleCode: role.code,
      message: `Role "${role.display_name}" created.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: getUserFriendlyErrorMessage(error, 'Unable to create role.'),
    };
  }
}
