import type { Metadata } from 'next';

import { AddUserDetailsStep } from '@/features/user-roles/components/add-user/step-details';
import { loadUserAssignmentOptions } from '@/lib/users-server';

export const metadata: Metadata = { title: 'Add User — Details' };

export default async function AddUserDetailsRoute() {
  const assignmentOptions = await loadUserAssignmentOptions();
  return <AddUserDetailsStep assignmentOptions={assignmentOptions} />;
}
