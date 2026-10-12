import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

interface PosTablesPageProps {
  searchParams?: {
    table?: string;
  };
}

export default function PosTablesPage({ searchParams }: PosTablesPageProps) {
  return <PosTableSelection initialTableId={searchParams?.table} />;
}
