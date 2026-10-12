import { DineInPage } from '@/features/pos/point-of-sale/dine-in';

interface PosDineInPageProps {
  searchParams?: {
    table?: string;
  };
}

export default function PosDineInPage({ searchParams }: PosDineInPageProps) {
  return <DineInPage initialTableId={searchParams?.table} />;
}
