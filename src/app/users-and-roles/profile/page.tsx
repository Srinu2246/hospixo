import type { Metadata } from 'next';
import { EditStaffProfileScreen } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'View Staff Profile | Hospixo Platform',
  description: 'View staff member profile information and permission controls.',
};

export default function ViewStaffProfilePage() {
  return <EditStaffProfileScreen initialMode="view" />;
}
