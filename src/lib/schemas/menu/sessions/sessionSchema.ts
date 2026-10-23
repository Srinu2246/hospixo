import { z } from 'zod';

export const sessionStatusSchema = z.enum(['active', 'inactive']);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const sessionRecordSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Session name is required'),
  startTime: z.string().trim().min(1, 'Start time is required'),
  endTime: z.string().trim().min(1, 'End time is required'),
  status: sessionStatusSchema,
  updatedAt: z.string(),
});
export type SessionRecord = z.infer<typeof sessionRecordSchema>;

export const sessionFormSchema = z.object({
  name: z.string().trim().min(2, 'Session name must be at least 2 characters'),
  startTime: z.string().trim().min(1, 'Start time is required'),
  endTime: z.string().trim().min(1, 'End time is required'),
  status: sessionStatusSchema.default('active'),
});
export type SessionFormValues = z.infer<typeof sessionFormSchema>;
