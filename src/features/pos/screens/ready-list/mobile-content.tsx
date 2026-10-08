import { CompactReadyListContent } from './compact-ready-list-content';
import type { ReadyListPageViewModel } from './use-ready-list-page';

export function ReadyListMobileContent(props: Readonly<ReadyListPageViewModel>) {
  return <CompactReadyListContent {...props} layout="mobile" />;
}
