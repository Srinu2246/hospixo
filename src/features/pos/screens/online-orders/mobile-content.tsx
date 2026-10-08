import { CompactOnlineOrdersContent } from './compact-online-orders-content';
import type { OnlineOrdersPageViewModel } from './use-online-orders-page';

export function OnlineOrdersMobileContent(props: Readonly<OnlineOrdersPageViewModel>) {
  return <CompactOnlineOrdersContent {...props} layout="mobile" />;
}
