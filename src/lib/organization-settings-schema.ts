import { z } from 'zod';

/**
 * Organization settings form schema — mirrors the real admin settings form
 * (name / ISO country code / city / IANA timezone).
 *
 * Rules are intentionally strict about codes: values like `india` or
 * `(GMT+04:00) Dubai, Abu Dhabi` are rejected here instead of travelling to
 * the API and failing there. Normalization (trim/uppercase) happens in the
 * submit handler, so this schema stays transform-free and its inferred type
 * matches React Hook Form's field values exactly.
 */
export const organizationSettingsSchema = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length >= 2, 'Organization name must be at least 2 characters'),
  countryCode: z
    .string()
    .refine(
      (value) => /^[A-Za-z]{2}$/.test(value.trim()),
      'Country must be a 2-letter ISO code (e.g. IN)',
    ),
  city: z.string().refine((value) => value.trim().length > 0, 'City is required'),
  timezone: z.string().refine((value) => value.trim().length > 0, 'Timezone is required'),
});

export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;

/** Trim/uppercase the validated values before sending them to the API. */
export function normalizeOrganizationSettings(
  input: OrganizationSettingsInput,
): OrganizationSettingsInput {
  return {
    name: input.name.trim(),
    countryCode: input.countryCode.trim().toUpperCase(),
    city: input.city.trim(),
    timezone: input.timezone.trim(),
  };
}
