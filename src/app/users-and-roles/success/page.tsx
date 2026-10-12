import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Invitation Sent Successfully | Hospixo Platform',
  description: 'Invitation email confirmation and summary.',
};

export default function SuccessPage() {
  return <CreateUserMultiformFlow initialStep="success" />;
}
