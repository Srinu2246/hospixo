import { Suspense } from 'react';

import { Loading } from '@/components/shared/ui/Loading';
import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';
import { readCheckoutOrderIdParam } from '@/lib/helpers/posOrderHelpers';

interface PosTablesSuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PosTablesSuccessPage({ searchParams }: PosTablesSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = readCheckoutOrderIdParam(resolvedSearchParams);

  return (
    <Suspense fallback={<Loading message="Loading receipt…" />}>
      <OrderSettle initialStep="success" orderId={orderId} />
    </Suspense>
  );
}
