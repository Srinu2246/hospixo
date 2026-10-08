'use client';

import type { OrderDetailsPageViewModel } from './use-order-details-page';
import { CompactOrderDetailsContent } from './compact-order-details-content';

export function OrderDetailsMobileContent(props: OrderDetailsPageViewModel) {
  return <CompactOrderDetailsContent {...props} layout="mobile" />;
}
