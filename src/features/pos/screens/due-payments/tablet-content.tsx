import { CompactDuePaymentsContent } from './compact-due-payments-content';
import type { DuePaymentsPageViewModel } from './use-due-payments-page';

export function DuePaymentsTabletContent(props: Readonly<DuePaymentsPageViewModel>) {
  return <CompactDuePaymentsContent {...props} layout="tablet" />;
}
