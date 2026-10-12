import { DineInPage } from '@/features/pos/point-of-sale/dine-in';

interface PosDineInTableRouteProps {
  params: {
    tableId: string;
  };
}

export default function PosDineInTableRoute({ params }: PosDineInTableRouteProps) {
  return <DineInPage initialTableId={params.tableId} />;
}
