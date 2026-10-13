import { redirect } from 'next/navigation';

interface PosTableDetailRouteProps {
  params: {
    tableId: string;
  };
}

/** Ordering lives under dine-in only — send legacy /tables/[tableId] links there. */
export default function PosTableDetailRoute({ params }: PosTableDetailRouteProps) {
  redirect(`/pos/point-of-sale/dine-in/${params.tableId}?from=tables`);
}
