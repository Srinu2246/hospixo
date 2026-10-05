import type {
  OrganizationCreateFormData,
  OrganizationCreateResult,
  OrganizationCreateStepId,
  PlatformCreateOrganizationV2Data,
  PlatformCreateOrganizationV2Request,
  PlatformOrganizationResponseData,
  PlatformOrganizationV2,
  PlatformOrganizationWriteRequest,
} from '@/types/organization-create';

import { routes } from '@/constants/routes';

export const organizationCreateSteps = [
  {
    id: 'details' as const,
    label: 'ORGANIZATION DETAILS',
    shortLabel: 'DETAILS',
    path: routes.admin.organizationsCreateDetails,
  },
  {
    id: 'commercial' as const,
    label: 'COMMERCIAL SETUP',
    shortLabel: 'COMMERCIAL',
    path: routes.admin.organizationsCreateCommercial,
  },
  {
    id: 'review' as const,
    label: 'REVIEW & SUBMIT',
    shortLabel: 'REVIEW',
    path: routes.admin.organizationsCreateReview,
  },
] satisfies ReadonlyArray<{
  id: OrganizationCreateStepId;
  label: string;
  shortLabel: string;
  path: string;
}>;

export const organizationCreateDefaults: OrganizationCreateFormData = {
  details: {
    name: '',
    country: '',
    city: '',
    timezone: '',
    baseCurrency: '',
    logoAssetId: '',
    logoFileName: '',
    logoPreviewUrl: '',
  },
  admin: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  commercial: {
    planPublicId: '',
    billingCycle: '',
    legalName: '',
    billingCountryCode: '',
    billingStateCode: '',
    taxRegistrationStatus: 'registered',
    taxRegistrationNumber: '',
    paymentMethodCode: '',
    sendWelcomeEmail: false,
  },
};

export const organizationCreateCopy = {
  breadcrumbParent: 'Organization Management',
  breadcrumbCurrent: 'Create Organization',
  detailsTitle: 'Organization Details',
  detailsSubtitle: 'Please provide the basic information about your hospitality organization.',
  commercialTitle: 'Commercial Setup',
  adminSectionTitle: 'Organization Admin',
  adminSectionSubtitle:
    "Set up the primary administrator who will manage this organization. They'll receive an invitation email to activate their account.",
  subscriptionSectionTitle: 'Subscription Setup',
  billingSectionTitle: 'Billing Profile',
  reviewTitle: 'Review & Submit',
  nextCommercial: 'Next: Commercial Setup ›',
  nextReview: 'Next: Review & Submit ›',
  submitOrganization: 'Create Organization',
  creatingOrganization: 'Creating…',
  completeTitle: 'Organization Created Successfully!',
  completeSubtitle: (name: string, plan: string) =>
    `Your new organization ${name} has been successfully setup with the ${plan} subscription plan. It is now active and ready for onboarding and brand customization.`,
  viewOrganizations: 'View Organizations',
  companySetup: 'Company Set-up',
  sendWelcomeEmail: 'Send welcome email with login credentials to the admin',
  saveDraft: 'Save as Draft',
  savingDraft: 'Saving draft…',
  draftSaved: 'Draft saved. You can resume it from Draft Organizations.',
  draftSaveError: 'Could not save draft. Please try again.',
  draftsTitle: 'Draft Organizations',
  draftsSubtitle: 'Resume in-progress organization setups saved as drafts.',
  draftsEmpty: 'No draft organizations yet.',
  resumeDraft: 'Resume setup',
  draftResumeLoading: 'Loading draft…',
  platformResponseTitle: 'Platform response',
  backendRequired:
    'Organization provisioning requires a configured backend API. Set BACKEND_API_URL and try again.',
  createFailed: 'Could not create the organization. Please review the form and try again.',
  createTimeout:
    'The API did not respond in time. Confirm BACKEND_API_URL in apps/admin/.env.local points to a running backend (for example https://dev-api.hospixo.com), then try again.',
  logoUploadError: 'Could not upload the logo. Please try again.',
  uploadingLogo: 'Uploading…',
} as const;

export const organizationCountryOptions = [
  'United States',
  'United Arab Emirates',
  'India',
  'United Kingdom',
] as const;

export const organizationTimezoneOptions = [
  'EST (UTC-5)',
  '(GMT+05:30) IST',
  '(GMT+04:00) GST',
  '(GMT+00:00) UTC',
] as const;

export const organizationCurrencyOptions = ['USD ($)', 'AED (د.إ)', 'INR (₹)', 'GBP (£)'] as const;

/** Backend `TaxRegistrationStatus` enum — MVP set only, no `exempt`/`pending_verification`. */
export const taxRegistrationStatusOptions = [
  { value: 'registered', label: 'Registered' },
  { value: 'unregistered', label: 'Unregistered' },
] as const;

/** Backend `BillingCycle` enum — the catalog's plan list doesn't expose which
 * cycles a given plan actually has priced, so this is offered independently. */
export const billingCycleOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

const currencyCodeByLabel: Record<string, string> = {
  'USD ($)': 'USD',
  'AED (د.إ)': 'AED',
  'INR (₹)': 'INR',
  'GBP (£)': 'GBP',
};

const timezoneByLabel: Record<string, string> = {
  'EST (UTC-5)': 'America/New_York',
  '(GMT+05:30) IST': 'Asia/Kolkata',
  '(GMT+04:00) GST': 'Asia/Dubai',
  '(GMT+00:00) UTC': 'UTC',
};

const countryCodeByLabel: Record<string, string> = {
  'United States': 'US',
  'United Arab Emirates': 'AE',
  India: 'IN',
  'United Kingdom': 'GB',
};

/** `{ label, value }` pairs for a billing-country select, sharing the operating-country list. */
export const organizationBillingCountryOptions = organizationCountryOptions.map((label) => ({
  label,
  value: countryCodeByLabel[label] ?? label,
}));

/** ISO country code for organization create country labels (Details step). */
export function resolveOrganizationCountryCode(countryLabel: string): string {
  const trimmed = countryLabel.trim();
  if (!trimmed) return '';
  return countryCodeByLabel[trimmed] ?? trimmed;
}

function nullableTrim(value: string): string | null {
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeCurrency(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return currencyCodeByLabel[trimmed] ?? trimmed;
}

function normalizeTimezone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return timezoneByLabel[trimmed] ?? trimmed;
}

function normalizeCountryCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return countryCodeByLabel[trimmed] ?? trimmed;
}

/** Payload for `POST /api/v2/platform/organizations`. */
export function toOrganizationCreatePayloadV2(
  data: OrganizationCreateFormData,
): PlatformCreateOrganizationV2Request {
  return {
    organization: {
      name: data.details.name.trim(),
      country_code: normalizeCountryCode(data.details.country),
      city: data.details.city.trim(),
      timezone: normalizeTimezone(data.details.timezone),
      base_currency: normalizeCurrency(data.details.baseCurrency),
      logo_asset_id: data.details.logoAssetId?.trim() ?? '',
    },
    initial_administrator: {
      first_name: data.admin.firstName.trim(),
      last_name: data.admin.lastName.trim(),
      email: data.admin.email.trim(),
      phone: data.admin.phone.trim(),
    },
    initial_subscription: {
      plan_public_id: data.commercial.planPublicId.trim(),
      billing_cycle: data.commercial.billingCycle.trim(),
      // Default every platform-created organization straight into "trialing"
      // rather than "pending_payment": the org's initial administrator only
      // has a pending invitation at creation time (no org_admin login exists
      // yet to complete checkout), and "pending_payment" both blocks a new
      // dedicated company-scope subscription for the same product AND is not
      // itself eligible to inherit from (see hospixo-backend's
      // scoped_lifecycle_service._ALLOWED state machine) — so without this,
      // every org created here is unusable via subscription_assignment.mode:
      // "inherit" until someone manually activates it out-of-band. Requires
      // the resolved SubscriptionPlan to have trial_eligible=true on the
      // backend (hospixo-backend scripts/seed.py marks the org-level catalog
      // plans this way) — a plan without it would 409 here instead.
      activation_mode: 'trial',
    },
    billing_profile: {
      legal_name: data.commercial.legalName.trim(),
      billing_country_code: data.commercial.billingCountryCode.trim(),
      billing_state_code: data.commercial.billingStateCode.trim(),
      tax_registration_status: data.commercial.taxRegistrationStatus.trim(),
      tax_registration_number: nullableTrim(data.commercial.taxRegistrationNumber),
      payment_method_code: data.commercial.paymentMethodCode.trim(),
    },
    onboarding: {
      send_welcome_email: data.commercial.sendWelcomeEmail,
    },
  };
}

/**
 * `POST/PATCH` payload for the legacy v1 draft-save endpoint.
 * The v2 create endpoint has no draft concept, so "Save as Draft" keeps using v1 —
 * fields the form no longer collects (domain, org code, password, credit limit,
 * contract dates, plan level) are sent as null.
 */
export function toOrganizationDraftPayload(
  data: OrganizationCreateFormData,
): PlatformOrganizationWriteRequest {
  const adminLastName = data.admin.lastName.trim();

  return {
    save_as_draft: true,
    domain: null,
    brand_name: data.details.name.trim(),
    admin_first_name: data.admin.firstName.trim(),
    admin_last_name: adminLastName || null,
    admin_email: data.admin.email.trim(),
    admin_phone: data.admin.phone.trim() || null,
    org_code: null,
    organization_type: null,
    country: nullableTrim(data.details.country),
    city: nullableTrim(data.details.city),
    timezone: normalizeTimezone(data.details.timezone) || null,
    base_currency: normalizeCurrency(data.details.baseCurrency) || null,
    subscription_plan: nullableTrim(data.commercial.planPublicId),
    plan_level: null,
    billing_cycle: nullableTrim(data.commercial.billingCycle),
    payment_method: nullableTrim(data.commercial.paymentMethodCode),
    tax_registration_number: nullableTrim(data.commercial.taxRegistrationNumber),
    tax_percentage: null,
    credit_limit: null,
    contract_start: null,
    contract_end: null,
    send_welcome_email: data.commercial.sendWelcomeEmail,
  };
}

export function resolveDraftResumePath(data: OrganizationCreateFormData): string {
  if (data.admin.email.trim() && data.commercial.planPublicId.trim()) {
    return routes.admin.organizationsCreateReview;
  }

  if (data.details.name.trim()) {
    return routes.admin.organizationsCreateCommercial;
  }

  return routes.admin.organizationsCreateDetails;
}

export function mapPlatformOrganizationResponseData(
  payload: Record<string, unknown>,
  organizationId?: string,
): PlatformOrganizationResponseData {
  const adminSource =
    payload.admin && typeof payload.admin === 'object'
      ? (payload.admin as Record<string, unknown>)
      : payload;

  const id = String(
    payload.id ??
      payload.org_id ??
      payload.organization_id ??
      payload.organizationId ??
      organizationId ??
      '',
  );
  const productIds = payload.product_ids;
  const normalizedProductIds = Array.isArray(productIds)
    ? productIds.map((value) => Number(value)).filter((value) => !Number.isNaN(value))
    : undefined;

  return {
    id,
    brand_name: String(payload.brand_name ?? payload.name ?? ''),
    domain: payload.domain ? String(payload.domain) : undefined,
    status: payload.status ? String(payload.status) : undefined,
    save_as_draft:
      payload.save_as_draft === true ? true : payload.save_as_draft === false ? false : undefined,
    admin_first_name: adminSource.admin_first_name
      ? String(adminSource.admin_first_name)
      : adminSource.first_name
        ? String(adminSource.first_name)
        : undefined,
    admin_last_name:
      adminSource.admin_last_name != null
        ? String(adminSource.admin_last_name)
        : adminSource.last_name != null
          ? String(adminSource.last_name)
          : undefined,
    admin_email: adminSource.admin_email
      ? String(adminSource.admin_email)
      : adminSource.email
        ? String(adminSource.email)
        : undefined,
    admin_phone: adminSource.admin_phone
      ? String(adminSource.admin_phone)
      : adminSource.phone
        ? String(adminSource.phone)
        : undefined,
    product_ids: normalizedProductIds,
    country: payload.country ? String(payload.country) : undefined,
    city: payload.city != null ? String(payload.city) : undefined,
    timezone: payload.timezone != null ? String(payload.timezone) : undefined,
    base_currency: payload.base_currency ? String(payload.base_currency) : undefined,
    created_at: payload.created_at ? String(payload.created_at) : undefined,
  };
}

/**
 * The v2 create-organization response also returns the numeric id (under `id`/`org_id`/
 * `organization_id`) that the rest of the admin app's `[organizationId]` routes and every
 * downstream API call expect. Prefer that over `public_id` so post-creation navigation
 * (organization overview, Create Company, …) and API calls use the same numeric id as
 * everything else, instead of the v2 public id.
 */
function extractOrganizationLegacyId(organization: PlatformOrganizationV2): string | null {
  const raw = organization as unknown as Record<string, unknown>;
  const candidates = [raw.id, raw.org_id, raw.organization_id];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate);
  }
  return null;
}

/** Flattens the nested v2 create response into label-friendly entries for the dev mutation panel. */
export function flattenOrganizationV2ResponseData(
  data: PlatformCreateOrganizationV2Data,
): Record<string, unknown> {
  return {
    organization_id: extractOrganizationLegacyId(data.organization) ?? data.organization.public_id,
    organization_public_id: data.organization.public_id,
    organization_name: data.organization.name,
    organization_code: data.organization.code,
    organization_domain: data.organization.domain,
    organization_status: data.organization.status,
    logo_display_url: data.organization.logo?.display_url,
    admin_email: data.administrator?.email,
    admin_membership_status: data.administrator?.membership_status,
    admin_invitation_expires_at: data.administrator?.invitation_expires_at,
    subscription_plan_code: data.subscription?.plan_code,
    subscription_status: data.subscription?.status,
    billing_legal_name: data.billing_profile?.legal_name,
    billing_status: data.billing_profile?.status,
    welcome_email_status: data.onboarding?.welcome_email?.status,
    created_at: data.created_at,
  };
}

/**
 * Maps a successful `POST /api/v2/platform/organizations` response.
 *
 * Takes the already-unwrapped `data` payload, not the `{success, data}`
 * envelope — `apiFetch` (packages/lib/src/api/http.ts::unwrapSuccessfulPayload)
 * strips the envelope for every caller before this function ever sees it.
 */
export function mapCreateOrgV2ApiResponse(
  data: PlatformCreateOrganizationV2Data,
  form: OrganizationCreateFormData,
): OrganizationCreateResult {
  const organizationId =
    extractOrganizationLegacyId(data.organization) ||
    data.organization.public_id ||
    slugifyOrganizationName(form.details.name);
  const organizationName = data.organization.name || form.details.name;
  const createdAtSource = data.created_at ? new Date(data.created_at) : new Date();
  const createdAt = Number.isNaN(createdAtSource.getTime())
    ? new Date().toLocaleDateString('en-US')
    : createdAtSource.toLocaleDateString('en-US');

  return {
    organizationId,
    organizationName,
    status: data.organization.status ?? 'Active',
    plan: data.subscription?.plan_code || form.commercial.planPublicId || '—',
    createdAt,
    data: flattenOrganizationV2ResponseData(data),
    source: 'api',
  };
}

export function mapCreateOrgFallbackResponse(
  form: OrganizationCreateFormData,
  organizationId: string,
  status = 'Active',
): OrganizationCreateResult {
  const payload = toOrganizationDraftPayload(form);

  const data = mapPlatformOrganizationResponseData(
    {
      id: organizationId,
      brand_name: form.details.name,
      status,
      admin_first_name: payload.admin_first_name,
      admin_last_name: payload.admin_last_name,
      admin_email: payload.admin_email,
      admin_phone: payload.admin_phone,
      save_as_draft: payload.save_as_draft,
      country: form.details.country,
      city: form.details.city,
      timezone: form.details.timezone,
      base_currency: form.details.baseCurrency,
    },
    organizationId,
  );

  return {
    organizationId,
    organizationName: String(data.brand_name || form.details.name),
    status,
    plan: form.commercial.planPublicId || '—',
    createdAt: new Date().toLocaleDateString('en-US'),
    data,
    source: 'local',
  };
}

function slugifyOrganizationName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replaceAll(/\s+/g, '-')
      .replaceAll(/[^a-z0-9-]/g, '') || 'new-organization'
  );
}
