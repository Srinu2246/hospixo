import { z } from 'zod';

import { isMealSessionFormTime } from '@/lib/helpers/mealSessionMapper';

export const sessionStatusSchema = z.enum(['active', 'inactive']);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const sessionNameSchema = z.enum(['morning', 'afternoon', 'evening', 'night', 'all_day'], {
  error: 'Select a session name',
});
export type SessionName = z.infer<typeof sessionNameSchema>;

export const SESSION_NAME_OPTIONS: ReadonlyArray<{ id: SessionName; label: string }> = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
  { id: 'all_day', label: 'All day' },
];

/** 24-hour time for native time picker (`HH:mm`). */
export const mealSessionFormTimeSchema = z
  .string()
  .trim()
  .refine(isMealSessionFormTime, { message: 'Select a valid time' });

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
  name: sessionNameSchema,
  startTime: mealSessionFormTimeSchema,
  endTime: mealSessionFormTimeSchema,
  status: sessionStatusSchema.default('active'),
});
export type SessionFormValues = z.infer<typeof sessionFormSchema>;
