import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { FloorSetupWizard } from '@/features/floor-table-setup';
import { floorCreatePath } from '@/features/floor-table-setup/lib/paths';
import { parseFloorRequestOptions, resolveFloorRequestContext } from '@/lib/floors-server';

export const metadata: Metadata = { title: 'Branch | Create floor' };

type BranchFloorCreatePageProps = Readonly<{
  searchParams: Promise<{
    outlet?: string;
    branch_id?: string;
    floorId?: string;
  }>;
}>;

export default async function BranchFloorCreatePage({ searchParams }: BranchFloorCreatePageProps) {
  const params = await searchParams;
  const context = await resolveFloorRequestContext(parseFloorRequestOptions(params));

  if (context.branchId != null && !params.outlet && !params.branch_id) {
    redirect(floorCreatePath(context.branchId, params.floorId));
  }

  return <FloorSetupWizard />;
}
