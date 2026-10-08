import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { tenancyContent } from '@/config/auth/tenancy';
import { FloorTableSetupPage } from '@/features/floor-table-setup';
import { floorTableSetupPath } from '@/features/floor-table-setup/lib/paths';
import { loadFloorsPageData, parseFloorRequestOptions } from '@/lib/floors-server';

export const metadata: Metadata = { title: 'Branch | Floor & Table Set-up' };

type BranchFloorTableSetupPageProps = Readonly<{
  searchParams: Promise<{
    outlet?: string;
    branch_id?: string;
  }>;
}>;

export default async function BranchFloorTableSetupPage({
  searchParams,
}: BranchFloorTableSetupPageProps) {
  const params = await searchParams;
  const data = await loadFloorsPageData(parseFloorRequestOptions(params));

  if (data.branchId != null && !params.outlet && !params.branch_id) {
    redirect(floorTableSetupPath(data.branchId));
  }

  const error = data.error === tenancyContent.branchRequiredForFloors ? null : data.error;

  return <FloorTableSetupPage floors={data.floors} error={error} branchId={data.branchId} />;
}
