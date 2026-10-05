import { z } from 'zod';
import { getCompanyStatesForCountry } from '@/constants/admin/company-create-catalog';
import {
  cityField,
  countryField,
  emailField,
  nameField,
  optionalTaxIdField,
  internationalPhoneField,
  requiredText,
} from '@/lib/validation/common';

import type { OrganizationCreateFormData } from '@/types/organization-create';

const billingStateFallbackPattern = /^[A-Z]{2,10}$/;

type CommercialBillingShape = Pick<
  OrganizationCreateFormData['commercial'],
  'billingCountryCode' | 'billingStateCode'
>;

type CommercialTaxShape = Pick<
  OrganizationCreateFormData['commercial'],
  'taxRegistrationStatus' | 'taxRegistrationNumber'
>;

function refineBillingStateCode(data: CommercialBillingShape, ctx: z.RefinementCtx) {
  const stateCode = data.billingStateCode.trim().toUpperCase();
  const states = getCompanyStatesForCountry(data.billingCountryCode);

  if (states.length > 0) {
    if (!states.some((state) => state.code === stateCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid billing state code for the selected country.',
        path: ['billingStateCode'],
      });
    }
    return;
  }

  if (!billingStateFallbackPattern.test(stateCode)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Enter a valid billing state code (2–10 letters).',
      path: ['billingStateCode'],
    });
  }
}

function refineTaxRegistrationNumber(data: CommercialTaxShape, ctx: z.RefinementCtx) {
  const taxNumber = data.taxRegistrationNumber.trim();

  if (data.taxRegistrationStatus === 'registered') {
    if (!taxNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tax registration number is required.',
        path: ['taxRegistrationNumber'],
      });
      return;
    }

    const formatResult = optionalTaxIdField.safeParse(taxNumber);
    if (!formatResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: formatResult.error.issues[0]?.message ?? 'Enter a valid tax registration number.',
        path: ['taxRegistrationNumber'],
      });
    }
    return;
  }

  const optionalResult = optionalTaxIdField.safeParse(taxNumber);
  if (!optionalResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: optionalResult.error.issues[0]?.message ?? 'Enter a valid tax registration number.',
      path: ['taxRegistrationNumber'],
    });
  }
}

export const organizationDetailsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Organization name is required')
    .regex(/^[A-Za-z\s]+$/, 'Organization name must contain letters only'),
  country: countryField,
  city: cityField,
  timezone: requiredText('Timezone'),
  baseCurrency: requiredText('Base currency'),
  logoAssetId: z.string().optional(),
  logoFileName: z.string().optional(),
  logoPreviewUrl: z.string().optional(),
});

/** V2 create uses invitation email — no password collected in the wizard. */
export const organizationAdminSchema = z.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  email: emailField,
  phone: internationalPhoneField,
});

export const organizationCommercialSchema = z
  .object({
    planPublicId: requiredText('Plan'),
    billingCycle: requiredText('Billing cycle'),
    legalName: requiredText('Legal entity name'),
    billingCountryCode: requiredText('Billing country code'),
    billingStateCode: requiredText('Billing state code'),
    taxRegistrationStatus: z.enum(['registered', 'unregistered'], {
      message: 'Select a tax registration status',
    }),
    taxRegistrationNumber: z.string(),
    paymentMethodCode: requiredText('Payment method code'),
    sendWelcomeEmail: z.boolean(),
  })
  .superRefine((data, ctx) => {
    refineBillingStateCode(data, ctx);
    refineTaxRegistrationNumber(data, ctx);
  });

export function canContinueOrganizationDetails(
  details: OrganizationCreateFormData['details'],
): boolean {
  return organizationDetailsSchema.safeParse(details).success;
}

export function canContinueOrganizationCommercial(
  data: Pick<OrganizationCreateFormData, 'admin' | 'commercial'>,
): boolean {
  const { admin, commercial } = data;
  return (
    organizationAdminSchema.safeParse(admin).success &&
    organizationCommercialSchema.safeParse(commercial).success
  );
}

export function getOrganizationCreateValidationError(
  data: OrganizationCreateFormData,
): string | null {
  const detailsResult = organizationDetailsSchema.safeParse(data.details);
  if (!detailsResult.success) {
    return detailsResult.error.issues[0]?.message ?? 'Correct the organization details.';
  }

  const adminResult = organizationAdminSchema.safeParse(data.admin);
  if (!adminResult.success) {
    return adminResult.error.issues[0]?.message ?? 'Correct the administrator details.';
  }

  const commercialResult = organizationCommercialSchema.safeParse(data.commercial);
  if (!commercialResult.success) {
    return commercialResult.error.issues[0]?.message ?? 'Correct the commercial setup.';
  }

  return null;
}

/** Full review-submit gate — mirrors every required field across both steps. */
export function canSubmitOrganizationCreate(data: OrganizationCreateFormData): boolean {
  return getOrganizationCreateValidationError(data) === null;
}

/** Shared primary-button gate for organization create wizard steps. */
export function isOrganizationCreateStepBlocked(
  canContinue: boolean,
  options?: Readonly<{ savingDraft?: boolean; catalogsReady?: boolean }>,
): boolean {
  if (options?.savingDraft) {
    return true;
  }
  if (options?.catalogsReady === false) {
    return true;
  }
  return !canContinue;
}
