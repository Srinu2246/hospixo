import type { Metadata } from 'next';

import { CreateUserPage } from '@/features/user-roles/components/create-user/create-user-page';
import { loadUserAssignmentOptions } from '@/lib/users-server';

export const metadata: Metadata = { title: 'Create User' };

export default async function CreateUserRoute() {
  const assignmentOptions = await loadUserAssignmentOptions();
  return <CreateUserPage assignmentOptions={assignmentOptions} />;
}
