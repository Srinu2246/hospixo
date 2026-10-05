const FIELD_LABELS: Record<string, string> = {
  id: 'Organization ID',
  brand_name: 'Brand name',
  domain: 'Domain',
  status: 'Status',
  save_as_draft: 'Saved as draft',
  admin_first_name: 'Admin first name',
  admin_last_name: 'Admin last name',
  admin_email: 'Admin email',
  admin_phone: 'Admin phone',
  product_ids: 'Product IDs',
  country: 'Country',
  city: 'City',
  timezone: 'Timezone',
  base_currency: 'Base currency',
  created_at: 'Created at',
  organization_id: 'Organization ID',
  organization_name: 'Organization name',
  organization_code: 'Organization code',
  organization_domain: 'Domain',
  organization_status: 'Status',
  logo_display_url: 'Logo URL',
  admin_membership_status: 'Admin membership status',
  admin_invitation_expires_at: 'Admin invitation expires at',
  subscription_plan_code: 'Subscription plan',
  subscription_status: 'Subscription status',
  billing_legal_name: 'Billing legal name',
  billing_status: 'Billing status',
  welcome_email_status: 'Welcome email status',
};

export function formatOrganizationResponseEntries(
  data: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ({
      label: FIELD_LABELS[key] ?? key,
      value: formatResponseValue(key, value),
    }));
}

function formatResponseValue(key: string, value: unknown): string {
  if (key === 'save_as_draft') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return value.join(', ');
  }

  return String(value);
}
