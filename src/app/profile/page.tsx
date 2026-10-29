import type { Metadata } from 'next';
import { AdminProfilePage } from '@/features/admin/profile';

export const metadata: Metadata = {
  title: 'User Profile Settings | Hospixo Platform',
  description:
    'Manage your profile information, safety parameters and update security credentials.',
};

export default function ProfilePage() {
  return <AdminProfilePage />;
}
