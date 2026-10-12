import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Create User | Hospixo Platform',
  description: 'Create a new user and assign permissions.',
};

export default function CreateUserPage() {
  return <CreateUserMultiformFlow initialStep="user-form" />;
}
