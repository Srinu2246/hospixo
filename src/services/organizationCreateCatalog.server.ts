import 'server-only';

import type {
  PaymentMethodCatalogEntry,
  SubscriptionPlanCatalogEntry,
} from '@/types/organization-create';

const SUBSCRIPTION_PLANS: readonly SubscriptionPlanCatalogEntry[] = [
  {
    code: 'launch',
    name: 'Launch',
    tierCode: 'launch',
    price: '49.00',
    currency: 'USD',
  },
  {
    code: 'essential',
    name: 'Essential',
    tierCode: 'essential',
    price: '99.00',
    currency: 'USD',
  },
  {
    code: 'growth',
    name: 'Growth',
    tierCode: 'growth',
    price: '199.00',
    currency: 'USD',
  },
  {
    code: 'professional',
    name: 'Professional',
    tierCode: 'professional',
    price: '399.00',
    currency: 'USD',
  },
];

const PAYMENT_METHODS: readonly PaymentMethodCatalogEntry[] = [
  { code: 'bank_transfer', name: 'Bank Transfer' },
  { code: 'credit_card', name: 'Credit Card' },
  { code: 'invoice', name: 'Invoice' },
];

export async function fetchSubscriptionPlanCatalog() {
  return { data: SUBSCRIPTION_PLANS, source: 'fallback' as const };
}

export async function fetchPaymentMethodCatalog() {
  return { data: PAYMENT_METHODS, source: 'fallback' as const };
}
