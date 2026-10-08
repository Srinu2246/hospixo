'use client';

import { ResponsivePosContent } from '@/features/pos/screens/shared/responsive-pos-content';
import { CheckoutDesktopContent } from './desktop-content';
import { CheckoutMobileContent } from './mobile-content';
import { CheckoutTabletContent } from './tablet-content';
import { useCheckoutPage } from './use-checkout-page';

export function CheckoutPaymentPage() {
  const page = useCheckoutPage();

  return (
    <ResponsivePosContent
      desktop={CheckoutDesktopContent}
      tablet={CheckoutTabletContent}
      mobile={CheckoutMobileContent}
      props={page}
    />
  );
}
