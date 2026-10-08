'use client';

import type { OrderDetailsPageViewModel } from './use-order-details-page';
import { CompactOrderDetailsContent } from './compact-order-details-content';

export function OrderDetailsTabletContent(props: OrderDetailsPageViewModel) {
  return <CompactOrderDetailsContent {...props} layout="tablet" />;
}
