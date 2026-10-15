import { DineInPage } from '@/features/pos/point-of-sale/dine-in';

interface PosDineInTableRouteProps {
  params: Promise<{ tableId: string }>;
}

export default async function PosDineInTableRoute({ params }: PosDineInTableRouteProps) {
  const resolvedParams = await params;
  return <DineInPage initialTableId={resolvedParams.tableId} />;
}
