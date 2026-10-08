'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { PaymentSuccessDesktopContent } from './desktop-content';
import { PaymentSuccessMobileContent } from './mobile-content';
import { PaymentSuccessTabletContent } from './tablet-content';
import { usePaymentSuccessPage } from './use-payment-success-page';

export function PaymentSuccessPage() {
  const page = usePaymentSuccessPage();

  return (
    <ResponsivePosContent
      desktop={PaymentSuccessDesktopContent}
      tablet={PaymentSuccessTabletContent}
      mobile={PaymentSuccessMobileContent}
      props={page}
    />
  );
}
