import { z } from 'zod';

export const otpLoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email / Mobile Number is required.'),
});

export type OtpLoginFormValues = z.infer<typeof otpLoginSchema>;
