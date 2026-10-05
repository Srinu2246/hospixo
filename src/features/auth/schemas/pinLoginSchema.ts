import { z } from 'zod';

export const pinLoginSchema = z.object({
  branch_id: z.string().trim().min(1, 'Branch ID is required.'),
  quick_pin: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'PIN must be exactly 4 digits.'),
});

export type PinLoginFormValues = z.infer<typeof pinLoginSchema>;
