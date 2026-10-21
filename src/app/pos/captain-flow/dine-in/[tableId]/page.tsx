import { DineInPage } from '@/features/pos/point-of-sale/dine-in';

interface CaptainFlowDineInTableRouteProps {
  params: Promise<{ tableId: string }>;
}

export default async function CaptainFlowDineInTableRoute({
  params,
}: CaptainFlowDineInTableRouteProps) {
  const { tableId } = await params;
  return <DineInPage initialTableId={tableId} />;
}
