import { z } from 'zod';

import { passwordSchema } from '@/lib/schemas/commonFieldsSchema';

export const acceptInvitationFormSchema = z.object({
  token: z.string().min(32, 'This invite token looks invalid. Request a new invitation.'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().optional().default(''),
  password: passwordSchema,
});

export type AcceptInvitationFormValues = z.infer<typeof acceptInvitationFormSchema>;

export const acceptInvitationBodySchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().nullable().optional(),
});

export const acceptInvitationResultSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z
    .object({
      id: z.coerce.number().int().optional(),
      status: z.string().optional(),
      email: z.string().optional(),
    })
    .optional(),
});
