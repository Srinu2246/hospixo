import { CompactOnlineOrdersContent } from './compact-online-orders-content';
import type { OnlineOrdersPageViewModel } from './use-online-orders-page';

export function OnlineOrdersTabletContent(props: Readonly<OnlineOrdersPageViewModel>) {
  return <CompactOnlineOrdersContent {...props} layout="tablet" />;
}
