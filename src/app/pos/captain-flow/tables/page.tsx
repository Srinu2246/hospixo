import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

interface CaptainFlowTablesPageProps {
  searchParams?: {
    table?: string;
  };
}

export default function CaptainFlowTablesPage({ searchParams }: CaptainFlowTablesPageProps) {
  return <PosTableSelection isDineIn={false} initialTableId={searchParams?.table} />;
}
