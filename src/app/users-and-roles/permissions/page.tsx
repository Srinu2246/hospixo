import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Configure Permissions | Hospixo Platform',
  description: 'Configure and assign custom user permissions.',
};

export default function PermissionsPage() {
  return <CreateUserMultiformFlow initialStep="permissions" />;
}
