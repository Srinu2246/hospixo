'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { CompactOrderDetailsContent } from './compact-order-details-content';
import { OrderDetailsDesktopContent } from './desktop-content';
import { OrderDetailsMobileContent } from './mobile-content';
import { OrderDetailsTabletContent } from './tablet-content';
import { useOrderDetailsPage } from './use-order-details-page';

interface OrderDetailsPageProps {
  orderId: string;
}

export function OrderDetailsPage({ orderId }: Readonly<OrderDetailsPageProps>) {
  const page = useOrderDetailsPage(orderId);

  return (
    <ResponsivePosContent
      desktop={OrderDetailsDesktopContent}
      tablet={OrderDetailsTabletContent}
      mobile={OrderDetailsMobileContent}
      props={page}
    />
  );
}
