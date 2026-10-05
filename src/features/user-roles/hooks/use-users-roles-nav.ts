'use client';

import { useMemo } from 'react';

import { routes } from '@/config/routes';
import { employeesListPath } from '@/features/user-roles/lib/paths';
import { useRoleManagementLevel } from '@/features/user-roles/hooks/use-role-management-level';

/**
 * Paths + active hierarchy level for Users & Roles flows.
 * Level comes from URL/nav context so company/branch screens filter templates correctly.
 */
export function useUsersRolesNav() {
  const level = useRoleManagementLevel();

  const dashboardHref =
    level === 'organisation'
      ? routes.dashboard.organisation
      : level === 'branch'
        ? routes.dashboard.branch
        : routes.dashboard.company;

  return useMemo(
    () => ({
      level,
      employeesHref: employeesListPath(level),
      /** Same as employeesHref — Users & Roles is one page. */
      rolesHref: employeesListPath(level),
      dashboardHref,
      addUser: routes.platform.usersRoles.addUser,
      createRole: routes.platform.usersRoles.createRole,
      editStaffPrefix: routes.platform.usersRoles.editStaffPrefix,
      viewStaffPrefix: routes.platform.usersRoles.viewStaffPrefix,
      createUser: routes.platform.usersRoles.createUser,
      invitationSuccess: routes.platform.usersRoles.invitationSuccess,
      invitations: routes.platform.usersRoles.invitations,
    }),
    [level, dashboardHref],
  );
}
