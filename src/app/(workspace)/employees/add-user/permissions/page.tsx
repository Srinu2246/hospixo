import type { Metadata } from 'next';

import { AddUserPermissionsRouteView } from '@/features/user-roles/components/add-user/add-user-permissions-route';

export const metadata: Metadata = { title: 'Add User — Permissions' };

export default function AddUserPermissionsRoute() {
  return <AddUserPermissionsRouteView />;
}
