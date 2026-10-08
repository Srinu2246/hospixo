import { describe, expect, it } from 'vitest';

import {
  CaptainAllOrdersPage,
  CaptainCheckoutPage,
  CaptainDineInPage,
  CaptainFlowPage,
  CaptainPaymentSuccessPage,
  CaptainReadyListPage,
} from '@/features/pos/captain-flow';
import { CheckoutPaymentPage } from '@/features/pos/screens/checkout-payment/checkout-payment-page';
import { DineInPage } from '@/features/pos/screens/dine-in/dine-in-page';
import { OpenOrdersPage } from '@/features/pos/screens/open-orders/open-orders-page';
import { PaymentSuccessPage } from '@/features/pos/screens/payment-success/payment-success-page';
import { ReadyListPage } from '@/features/pos/screens/ready-list/ready-list-page';
import { TablesPage } from '@/features/pos/screens/tables/tables-page';

describe('captain-flow page exports', () => {
  it('re-exports shared POS screens (no duplicated captain UI)', () => {
    expect(CaptainFlowPage).toBe(TablesPage);
    expect(CaptainDineInPage).toBe(DineInPage);
    expect(CaptainReadyListPage).toBe(ReadyListPage);
    expect(CaptainAllOrdersPage).toBe(OpenOrdersPage);
    expect(CaptainCheckoutPage).toBe(CheckoutPaymentPage);
    expect(CaptainPaymentSuccessPage).toBe(PaymentSuccessPage);
  });
});
