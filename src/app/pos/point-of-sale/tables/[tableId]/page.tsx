import { redirect } from 'next/navigation';

interface PosTableDetailRouteProps {
  params: Promise<{ tableId: string }>;
}

/** Ordering lives under dine-in only — send legacy /tables/[tableId] links there. */
export default async function PosTableDetailRoute({ params }: PosTableDetailRouteProps) {
  const resolvedParams = await params;
  redirect(`/pos/point-of-sale/dine-in/${resolvedParams.tableId}?from=tables`);
}
