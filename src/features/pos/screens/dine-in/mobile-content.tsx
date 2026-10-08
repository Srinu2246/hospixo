import { CompactDineInContent } from './compact-dine-in-content';
import type { DineInPageViewModel } from './use-dine-in-page';

export function DineInMobileContent(props: Readonly<DineInPageViewModel>) {
  return <CompactDineInContent {...props} layout="mobile" />;
}
