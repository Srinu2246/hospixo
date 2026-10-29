import type { Metadata } from 'next';
import { AdminProfilePage } from '@/features/admin/profile';

export const metadata: Metadata = {
  title: 'Admin Profile Settings | Hospixo Platform',
  description:
    'Manage admin profile information, safety parameters and update security credentials.',
};

export default function AdminProfileRoute() {
  return <AdminProfilePage />;
}
