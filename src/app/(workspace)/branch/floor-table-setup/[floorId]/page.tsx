import { Suspense } from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FloorDetailPage } from '@/features/floor-table-setup';
import { floorDetailPath, floorSetupPickerPath } from '@/features/floor-table-setup/lib/paths';
import { getServerAuthSession } from '@/lib/auth/session';
import { loadFloorDetailPageData, parseFloorRequestOptions } from '@/lib/floors-server';

export const metadata: Metadata = { title: 'Branch | Floor details' };

interface FloorDetailRouteProps {
  params: Promise<{ floorId: string }>;
  searchParams: Promise<{
    outlet?: string;
    branch_id?: string;
  }>;
}

export default async function BranchFloorDetailPage({
  params,
  searchParams,
}: FloorDetailRouteProps) {
  const { floorId } = await params;
  const query = await searchParams;
  const data = await loadFloorDetailPageData(floorId, parseFloorRequestOptions(query));

  if (data.branchId != null && !query.outlet && !query.branch_id) {
    redirect(floorDetailPath(floorId, undefined, data.branchId));
  }

  if (data.branchId == null) {
    const session = await getServerAuthSession();
    redirect(floorSetupPickerPath(session?.user, floorDetailPath(floorId)));
  }

  return (
    <Suspense>
      <FloorDetailPage floorId={floorId} initialFloor={data.floor} error={data.error} />
    </Suspense>
  );
}
