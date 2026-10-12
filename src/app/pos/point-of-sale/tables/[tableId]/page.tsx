import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

interface PosTableDetailRouteProps {
  params: {
    tableId: string;
  };
}

export default function PosTableDetailRoute({ params }: PosTableDetailRouteProps) {
  return <PosTableSelection isDineIn={false} initialTableId={params.tableId} />;
}
