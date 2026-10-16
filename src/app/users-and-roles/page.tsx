import type { Metadata } from 'next';
import { UsersAndRolesScreen } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Users & Roles | Hospixo Platform',
  description: 'Manage your team members and their system access levels.',
};

export default function UsersAndRolesPage() {
  return <UsersAndRolesScreen />;
}
