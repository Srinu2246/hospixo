import { CompactDuePaymentsContent } from './compact-due-payments-content';
import type { DuePaymentsPageViewModel } from './use-due-payments-page';

export function DuePaymentsMobileContent(props: Readonly<DuePaymentsPageViewModel>) {
  return <CompactDuePaymentsContent {...props} layout="mobile" />;
}
