import { OrganizationCommercialStep } from '@/components/organization/create';
import {
  fetchPaymentMethodCatalog,
  fetchSubscriptionPlanCatalog,
} from '@/services/organizationCreateCatalog.server';

export default async function OrganizationCreateCommercialPage() {
  const [plans, paymentMethods] = await Promise.all([
    fetchSubscriptionPlanCatalog(),
    fetchPaymentMethodCatalog(),
  ]);

  return <OrganizationCommercialStep plans={plans.data} paymentMethods={paymentMethods.data} />;
}
