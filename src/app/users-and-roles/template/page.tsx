import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Role Template | Hospixo Platform',
  description: 'Select a role template to configure user access and permissions.',
};

export default function RoleTemplatePage() {
  return <CreateUserMultiformFlow initialStep="template" />;
}
