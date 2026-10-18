import { z } from 'zod';

export const menuSessionFormSchema = z.object({
  name: z.string().trim().min(2, 'Session name must be at least 2 characters'),
  code: z
    .string()
    .trim()
    .min(2, 'Session code must be at least 2 characters')
    .max(32, 'Session code must be at most 32 characters'),
  menuType: z.string().trim().min(1, 'Menu type is required'),
  description: z.string().trim().optional().default(''),
});

export type MenuSessionFormValues = z.infer<typeof menuSessionFormSchema>;
