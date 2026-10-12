import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

interface CaptainFlowTableDetailRouteProps {
  params: {
    tableId: string;
  };
}

export default function CaptainFlowTableDetailRoute({ params }: CaptainFlowTableDetailRouteProps) {
  return <PosTableSelection isDineIn={false} initialTableId={params.tableId} />;
}
