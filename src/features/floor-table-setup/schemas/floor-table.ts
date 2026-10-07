import { z } from 'zod';

export const floorStatusSchema = z.enum(['active', 'inactive']);
export const tableStatusSchema = z.enum(['active', 'inactive']);
export const tableShapeSchema = z.enum(['square', 'round', 'rectangle']);

export const createFloorFormSchema = z.object({
  name: z.string().trim().min(1, 'Floor name is required').max(80, 'Floor name is too long'),
  sort_order: z.number().int().min(0).optional(),
  status: floorStatusSchema,
});

export const createTableFormSchema = z.object({
  name: z.string().trim().min(1, 'Table name is required').max(40, 'Table name is too long'),
  seats: z
    .number()
    .int('Seats must be a whole number')
    .min(1, 'At least 1 seat is required')
    .max(50, 'Maximum 50 seats'),
  shape: tableShapeSchema,
  sort_order: z.number().int().min(0).optional(),
  status: tableStatusSchema,
});

export type CreateFloorFormValues = z.infer<typeof createFloorFormSchema>;
export type CreateTableFormValues = z.infer<typeof createTableFormSchema>;
