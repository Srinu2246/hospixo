import type { Metadata } from 'next';

import { EditStaffPage } from '@/features/user-roles/components/edit-staff/edit-staff-page';
import { loadEditStaffPageData } from '@/lib/users-server';

export const metadata: Metadata = { title: 'Edit Staff' };

type EditStaffRouteProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EditStaffRoute({ params }: EditStaffRouteProps) {
  const { id } = await params;
  const initialData = await loadEditStaffPageData(id);
  return <EditStaffPage staffId={id} initialData={initialData} />;
}
