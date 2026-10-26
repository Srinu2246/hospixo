import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'User Created Successfully | Hospixo Platform',
  description: 'Confirmation and summary after creating a new user.',
};

export default function SuccessPage() {
  return <CreateUserMultiformFlow initialStep="success" />;
}
