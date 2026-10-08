/**
 * Captain Flow reuses shared POS screens so the flow stays aligned with
 * POS navigation, state, and responsive layouts.
 *
 * URLs stay under `/captain/*` via `resolvePosFlowPaths` / `usePosFlowPaths`.
 */
export { TablesPage as CaptainFlowPage } from '@/features/pos/screens/tables/tables-page';
export { DineInPage as CaptainDineInPage } from '@/features/pos/screens/dine-in/dine-in-page';
export { ReadyListPage as CaptainReadyListPage } from '@/features/pos/screens/ready-list/ready-list-page';
export { OpenOrdersPage as CaptainAllOrdersPage } from '@/features/pos/screens/open-orders/open-orders-page';
export { OrderDetailsPage as CaptainOrderDetailsPage } from '@/features/pos/screens/order-details/order-details-page';
export { CheckoutPaymentPage as CaptainCheckoutPage } from '@/features/pos/screens/checkout-payment/checkout-payment-page';
export { PaymentSuccessPage as CaptainPaymentSuccessPage } from '@/features/pos/screens/payment-success/payment-success-page';
