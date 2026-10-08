import { CompactDineInContent } from './compact-dine-in-content';
import type { DineInPageViewModel } from './use-dine-in-page';

export function DineInTabletContent(props: Readonly<DineInPageViewModel>) {
  return <CompactDineInContent {...props} layout="tablet" />;
}
