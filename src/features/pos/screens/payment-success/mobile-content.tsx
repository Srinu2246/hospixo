import { CompactPaymentSuccessContent } from './compact-payment-success-content';
import type { PaymentSuccessPageViewModel } from './use-payment-success-page';

export function PaymentSuccessMobileContent(props: Readonly<PaymentSuccessPageViewModel>) {
  return <CompactPaymentSuccessContent {...props} layout="mobile" />;
}
