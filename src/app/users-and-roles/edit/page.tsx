import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EditStaffProfileScreen } from '@/features/employees/user-roles';

export const metadata: Metadata = {
  title: 'Edit Staff Profile | Hospixo Platform',
  description: 'Update staff member profile information and permission controls.',
};

export default function EditStaffProfilePage() {
  return (
    <Suspense fallback={null}>
      <EditStaffProfileScreen initialMode="edit" />
    </Suspense>
  );
}
