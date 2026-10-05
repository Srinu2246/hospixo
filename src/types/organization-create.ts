export type OrganizationCreateStepId = 'details' | 'commercial' | 'review';

export interface OrganizationDetailsData {
  name: string;
  country: string;
  city: string;
  timezone: string;
  baseCurrency: string;
  /** Set once the logo has finished uploading via the assets API. */
  logoAssetId?: string;
  logoFileName?: string;
  /** Preview URL returned by the assets API once the upload completes. */
  logoPreviewUrl?: string;
}

export interface OrganizationAdminData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface OrganizationCommercialData {
  planPublicId: string;
  billingCycle: string;
  legalName: string;
  billingCountryCode: string;
  billingStateCode: string;
  taxRegistrationStatus: string;
  taxRegistrationNumber: string;
  paymentMethodCode: string;
  sendWelcomeEmail: boolean;
}

/**
 * One row of `GET /api/v1/platform/subscription-catalog/plans`, active plans only.
 * The list endpoint returns one row per plan tier, not per billing cycle — pricing
 * (and which cycles are actually available) lives on the plan's versions/prices,
 * not here, so billing cycle is collected as an independent field.
 */
export type SubscriptionPlanCatalogEntry = Readonly<{
  code: string;
  name: string;
  tierCode: string | null;
  price: string | null;
  currency: string;
}>;

/** One row of `GET /api/v2/platform/billing/payment-methods`. */
export type PaymentMethodCatalogEntry = Readonly<{
  code: string;
  name: string;
}>;

export interface OrganizationCreateFormData {
  details: OrganizationDetailsData;
  admin: OrganizationAdminData;
  commercial: OrganizationCommercialData;
}

/** Payload for `POST /api/v2/platform/organizations`. */
export type PlatformCreateOrganizationV2Request = Readonly<{
  organization: Readonly<{
    name: string;
    country_code: string;
    city: string;
    timezone: string;
    base_currency: string;
    /** Required, non-nullable per the backend schema — empty string means "no logo". */
    logo_asset_id: string;
  }>;
  initial_administrator: Readonly<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }>;
  initial_subscription: Readonly<{
    plan_public_id: string;
    billing_cycle: string;
    /** Only `"trial"` is a supported value; any other non-null value is rejected. */
    activation_mode: string | null;
  }>;
  billing_profile: Readonly<{
    legal_name: string;
    billing_country_code: string;
    billing_state_code: string;
    tax_registration_status: string;
    tax_registration_number: string | null;
    payment_method_code: string;
  }>;
  onboarding: Readonly<{
    send_welcome_email: boolean;
  }>;
}>;

export type PlatformOrganizationV2 = Readonly<{
  id?: number;
  public_id: string;
  name: string;
  code?: string;
  domain?: string;
  country_code?: string;
  timezone?: string;
  base_currency?: string;
  status?: string;
  logo?: Readonly<{ asset_public_id?: string; display_url?: string }>;
}>;

export type PlatformAdministratorV2 = Readonly<{
  mode?: string;
  user_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  membership_status?: string;
  invitation_public_id?: string;
  invitation_expires_at?: string;
  delivery_status?: string;
}>;

export type PlatformSubscriptionV2 = Readonly<{
  public_id?: string;
  plan_code?: string;
  billing_cycle?: string;
  status?: string;
  billing_account_public_id?: string;
  trial_end_date?: string;
  current_period_start?: string;
  current_period_end?: string;
}>;

export type PlatformBillingProfileV2 = Readonly<{
  public_id?: string;
  legal_name?: string;
  billing_country_code?: string;
  billing_state_code?: string;
  tax_registration_status?: string;
  tax_registration_number?: string;
  payment_method_code?: string;
  requires_external_setup?: boolean;
  billing_currency?: string;
  status?: string;
}>;

/** `data` on the `POST /api/v2/platform/organizations` response. */
export type PlatformCreateOrganizationV2Data = Readonly<{
  organization: PlatformOrganizationV2;
  administrator?: PlatformAdministratorV2;
  subscription?: PlatformSubscriptionV2;
  billing_profile?: PlatformBillingProfileV2;
  onboarding?: Readonly<{
    welcome_email?: Readonly<{ status?: string; event_public_id?: string }>;
  }>;
  created_at?: string;
  next_steps?: readonly Readonly<{
    code: string;
    label: string;
    method: string;
    path: string;
  }>[];
}>;

/** Safe subset of platform organization data exposed to the client after mutations. */
export type PlatformOrganizationResponseData = Readonly<{
  id: string;
  brand_name: string;
  domain?: string;
  status?: string;
  save_as_draft?: boolean;
  admin_first_name?: string;
  admin_last_name?: string | null;
  admin_email?: string;
  admin_phone?: string | null;
  product_ids?: readonly number[];
  country?: string;
  city?: string | null;
  timezone?: string | null;
  base_currency?: string | null;
  created_at?: string;
}>;

export interface OrganizationCreateResult {
  organizationId: string;
  organizationName: string;
  status: string;
  plan: string;
  createdAt: string;
  /** Flattened response fields shown on the dev-only mutation panel; shape differs by source (v1 draft vs v2 create). */
  data: Record<string, unknown>;
  /** How the organization was provisioned — never treat local as a real tenant login. */
  source: 'api' | 'local';
}

/**
 * Legacy (v1) write body — only `savePlatformOrganizationDraft`/draft-finalize still use this.
 * The v2 create endpoint has no draft concept, so drafts keep going through v1 with the
 * fields the current form no longer collects (domain, org code, password, credit limit,
 * contract dates, plan level) sent as null.
 */
export type PlatformOrganizationWriteRequest = Readonly<{
  save_as_draft: boolean;
  domain?: string | null;
  brand_name: string;
  admin_first_name: string;
  admin_last_name?: string | null;
  admin_email: string;
  admin_phone?: string | null;
  org_code?: string | null;
  organization_type?: string | null;
  country?: string | null;
  city?: string | null;
  timezone?: string | null;
  base_currency?: string | null;
  subscription_plan?: string | null;
  plan_level?: string | null;
  billing_cycle?: string | null;
  payment_method?: string | null;
  tax_registration_number?: string | null;
  tax_percentage?: string | null;
  credit_limit?: string | null;
  contract_start?: string | null;
  contract_end?: string | null;
  send_welcome_email?: boolean;
}>;

export type OrganizationDraftSaveResult = Readonly<{
  ok: boolean;
  draftOrganizationId: string;
  message: string;
  source: 'api' | 'local';
  data: PlatformOrganizationResponseData;
}>;
