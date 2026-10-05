import { z } from 'zod';
import { nameField, optionalPhoneField, requiredText, emailField } from '@/lib/validation/common';

export const userInvitationSchema = z
  .object({
    firstName: nameField('First name'),
    lastName: nameField('Last name'),
    email: emailField,
    phone: optionalPhoneField.optional(),
    scope: z.enum(['organisation', 'company', 'branch']).optional(),
    company: z.string().trim().optional(),
    companyId: z.number().int().positive().nullable().optional(),
    branch: z.string().trim().optional(),
    branchId: z.number().int().positive().nullable().optional(),
    role: requiredText('Role'),
    message: z
      .string()
      .trim()
      .max(500, 'Personal message must be 500 characters or fewer.')
      .optional()
      .default(''),
  })
  .superRefine((data, ctx) => {
    const scope = data.scope ?? 'branch';
    if (scope === 'company') {
      if (!data.company?.trim() && !data.companyId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select a company.',
          path: ['company'],
        });
      }
    } else if (scope === 'branch') {
      if (!data.branch?.trim() && !data.branchId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Branch is required.',
          path: ['branch'],
        });
      }
    }
  });

export type UserInvitationInput = z.infer<typeof userInvitationSchema>;

export function getValidationError(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Check the form and try again.';
}

export function validateUserInvitation(input: unknown) {
  const result = userInvitationSchema.safeParse(input);
  return result.success ? result.data : getValidationError(result.error);
}
