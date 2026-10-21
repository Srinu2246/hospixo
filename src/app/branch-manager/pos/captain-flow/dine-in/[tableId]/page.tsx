import { DineInPage } from '@/features/pos/point-of-sale/dine-in';

interface BranchManagerCaptainDineInTableRouteProps {
  params: Promise<{ tableId: string }>;
}

export default async function BranchManagerCaptainDineInTableRoute({
  params,
}: BranchManagerCaptainDineInTableRouteProps) {
  const { tableId } = await params;
  return <DineInPage initialTableId={tableId} />;
}
