import type { Metadata } from 'next';
import { CreateUserMultiformFlow } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Review & Save User | Hospixo Platform',
  description: 'Review role summary, user information and permissions before saving.',
};

export default function ReviewPage() {
  return <CreateUserMultiformFlow initialStep="review" />;
}
