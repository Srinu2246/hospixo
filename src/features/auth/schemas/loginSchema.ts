import { z } from 'zod';

export const loginSchema = z.object({
  domain: z.string().trim().min(1, 'Organization is required.'),
  email: z.string().trim().min(1, 'Email / Mobile Number is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
