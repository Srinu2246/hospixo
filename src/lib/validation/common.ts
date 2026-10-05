import { z } from 'zod';

/** City/state allowed chars: letters, digits, space, `.`, `-`, `#`, `:`. */
export const CITY_STATE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\s.\-#:]*$/;

export const cityFieldErrorMessage =
  'City contains unsupported characters. Allowed: letters, numbers, ., -, # and :';

export const stateFieldErrorMessage =
  'State contains unsupported characters. Allowed: letters, numbers, ., -, # and :';

export const phoneFieldErrorMessage = 'Enter a valid phone number.';

export const passwordRequirementsHint =
  'At least 8 characters with uppercase, lowercase, number, and special character.';

export const requiredText = (label = 'This field') =>
  z.string().trim().min(1, `${label} is required.`);

export const nameField = (label: string) =>
  requiredText(label)
    .max(80, `${label} must be 80 characters or fewer.`)
    .regex(/^[\p{L}][\p{L}\s.'-]*$/u, `${label} contains invalid characters.`);

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .max(254, 'Email must be 254 characters or fewer.')
  .email('Enter a valid email address.');

/** E.164 international phone number. */
export const internationalPhoneField = z
  .string()
  .trim()
  .min(1, 'Phone is required.')
  .regex(/^\+[1-9]\d{7,14}$/, phoneFieldErrorMessage);

export const optionalInternationalPhoneField = z
  .string()
  .trim()
  .refine((value) => !value || /^\+[1-9]\d{7,14}$/.test(value), phoneFieldErrorMessage);

export const optionalPhoneField = optionalInternationalPhoneField;

export const addressField = requiredText('Address')
  .min(5, 'Address must be at least 5 characters.')
  .max(240, 'Address must be 240 characters or fewer.')
  .regex(
    /^[\p{L}\p{N}][\p{L}\p{N}\s,.'/#()\-]*$/u,
    'Enter a valid address using letters, numbers, and standard address punctuation.',
  );

export const cityField = requiredText('City')
  .max(80, 'City must be 80 characters or fewer.')
  .regex(CITY_STATE_PATTERN, cityFieldErrorMessage);

export const stateField = requiredText('State')
  .max(80, 'State must be 80 characters or fewer.')
  .regex(CITY_STATE_PATTERN, stateFieldErrorMessage);

/** Platform admin password — aligned with org/company create API usage in tests. */
export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Password does not meet the required criteria.')
  .regex(/[a-z]/, 'Password does not meet the required criteria.')
  .regex(/[0-9]/, 'Password does not meet the required criteria.')
  .regex(/[^A-Za-z0-9]/, 'Password does not meet the required criteria.');

/** Optional tax ID — trim; validate when provided (backend accepts alphanumeric IDs). */
export const optionalTaxIdField = z
  .string()
  .trim()
  .refine((value) => value === '' || /^[A-Za-z0-9-]{2,32}$/.test(value), 'Enter a valid Tax ID.');

export const branchNameField = requiredText('Branch name')
  .max(120, 'Branch name must be 120 characters or fewer.')
  .regex(/^[\p{L}\p{N}][\p{L}\p{N}\s.'-]*$/u, 'Branch name contains invalid characters.');

export const branchCodeField = requiredText('Branch code')
  .max(20, 'Branch code must be 20 characters or fewer.')
  .regex(/^[A-Za-z0-9-]+$/, 'Branch code contains invalid characters.');

export const countryField = requiredText('Country')
  .max(80, 'Country must be 80 characters or fewer.')
  .regex(/^[\p{L}][\p{L}\s.'-]*$/u, 'Country contains invalid characters.');

const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  india: 'IN',
  'united states': 'US',
  'united kingdom': 'GB',
  canada: 'CA',
  australia: 'AU',
  'united arab emirates': 'AE',
};

export function resolveCountryCode(country: string): string {
  const trimmed = country.trim();
  if (/^[A-Z]{2}$/i.test(trimmed)) return trimmed.toUpperCase();

  return COUNTRY_NAME_TO_ISO[trimmed.toLowerCase()] ?? 'OTHER';
}

export function getPostalCodeSchema(country: string) {
  switch (resolveCountryCode(country)) {
    case 'IN':
      return z
        .string()
        .trim()
        .regex(/^[1-9]\d{5}$/, 'Enter a valid Indian pincode.');
    case 'US':
      return z
        .string()
        .trim()
        .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code.');
    case 'GB':
      return z
        .string()
        .trim()
        .regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i, 'Enter a valid UK postcode.');
    case 'CA':
      return z
        .string()
        .trim()
        .regex(/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i, 'Enter a valid Canadian postal code.');
    case 'AU':
      return z
        .string()
        .trim()
        .regex(/^\d{4}$/, 'Enter a valid Australian postcode.');
    case 'AE':
      return z
        .string()
        .trim()
        .regex(/^\d{5}$/, 'Enter a valid UAE postal code.');
    default:
      return z
        .string()
        .trim()
        .min(2, 'Enter a valid postal code.')
        .max(16, 'Enter a valid postal code.')
        .regex(/^[A-Za-z0-9\s-]+$/, 'Enter a valid postal code.');
  }
}

/** @deprecated Use `getPostalCodeSchema(country)` for country-aware validation. */
export const pincodeField = getPostalCodeSchema('IN');

export const optionalUrlField = z
  .string()
  .trim()
  .refine((value) => !value || /^https?:\/\/[^\s]+$/i.test(value), 'Enter a valid URL.');

export const domainField = requiredText('Organization domain')
  .max(63, 'Organization domain must be 63 characters or fewer.')
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Enter a valid organization domain.');

export const positiveIntegerField = (label: string) =>
  requiredText(label)
    .regex(/^\d+$/, `Enter a valid ${label.toLowerCase()}.`)
    .refine((value) => Number(value) > 0, `Enter a valid ${label.toLowerCase()}.`);

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parses `<input type="date">` values (`YYYY-MM-DD`) in local calendar terms. */
export function parseLocalDateInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const [year, month, day] = trimmed.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function formatLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Optional date input — when set, must be today or earlier (no future dates). */
export function optionalDateNotAfterTodayField(label: string) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) return;

    const parsed = parseLocalDateInput(value);
    if (!parsed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Enter a valid ${label.toLowerCase()}.`,
      });
      return;
    }

    if (parsed.getTime() > startOfLocalDay(new Date()).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} cannot be in the future.`,
      });
    }
  });
}

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Check the form and try again.';
}
