import { z } from 'zod';

export const phoneEntrySchema = z.object({
  id: z.string(),
  number: z.string().min(5, 'Enter a valid phone number'),
  verified: z.boolean().default(true),
});

export const userProfileSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  mobileNumbers: z.array(phoneEntrySchema),
  twoFactorLogin: z.boolean().default(true),
  twoFactorProtection: z.boolean().default(true),
});

export type PhoneEntry = z.infer<typeof phoneEntrySchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

export const editUserInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  mobileNumbers: z.array(phoneEntrySchema).min(1, 'At least one phone number is required'),
});

export type EditUserInfoValues = z.infer<typeof editUserInfoSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[a-z]/, 'At least 1 lowercase letter (a-z)')
      .regex(/[A-Z]/, 'At least 1 uppercase letter (A-Z)')
      .regex(/[0-9]/, 'At least 1 number (0-9)')
      .regex(/[@!#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'At least 1 special character (@!$%)'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordPayloadSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'New password must be at least 8 characters'),
});

export type ChangePasswordPayload = z.infer<typeof changePasswordPayloadSchema>;

export const changePasswordResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

export type ChangePasswordResponse = z.infer<typeof changePasswordResponseSchema>;
