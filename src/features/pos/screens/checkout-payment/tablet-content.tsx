import { CompactCheckoutContent } from './compact-checkout-content';
import type { CheckoutPageViewModel } from './use-checkout-page';

export function CheckoutTabletContent(props: Readonly<CheckoutPageViewModel>) {
  return <CompactCheckoutContent {...props} layout="tablet" />;
}
