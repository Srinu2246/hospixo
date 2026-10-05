import type { Metadata } from 'next';

import { ViewStaffPage } from '@/features/user-roles/components/view-staff/view-staff-page';
import { loadEditStaffPageData } from '@/lib/users-server';

export const metadata: Metadata = { title: 'View Staff Profile' };

type ViewStaffRouteProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function ViewStaffRoute({ params }: ViewStaffRouteProps) {
  const { id } = await params;
  const initialData = await loadEditStaffPageData(id);
  return <ViewStaffPage staffId={id} initialData={initialData} />;
}
