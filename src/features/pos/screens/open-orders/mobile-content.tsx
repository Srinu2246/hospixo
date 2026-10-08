import { CompactOpenOrdersContent } from './compact-open-orders-content';
import type { OpenOrdersPageViewModel } from './use-open-orders-page';

export function OpenOrdersMobileContent(props: Readonly<OpenOrdersPageViewModel>) {
  return <CompactOpenOrdersContent {...props} layout="mobile" />;
}
