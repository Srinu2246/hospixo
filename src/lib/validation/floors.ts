import { z } from 'zod';

import { firstZodError, requiredText } from './common';

export const floorTypeSchema = z.enum(['indoor', 'outdoor', 'vip', 'banquet'], {
  error: 'Floor type is required.',
});

export const lifecycleStatusSchema = z.enum(['active', 'inactive', 'archived'], {
  error: 'Status is required.',
});

const optionalFloorCode = z
  .string()
  .trim()
  .max(40, 'Floor code must be 40 characters or fewer.')
  .regex(/^[A-Za-z0-9-]*$/, 'Floor code can contain only letters, numbers, and hyphens.')
  .optional()
  .nullable();

const requiredFloorCode = requiredText('Floor code')
  .max(40, 'Floor code must be 40 characters or fewer.')
  .regex(/^[A-Za-z0-9-]+$/, 'Floor code can contain only letters, numbers, and hyphens.');

const optionalFloorDescription = z
  .string()
  .trim()
  .max(500, 'Description must be 500 characters or fewer.')
  .optional()
  .nullable();

const versionField = z.number().int().positive('Version is required.');

export const createFloorSchema = z.object({
  name: requiredText('Floor name').max(100, 'Floor name must be 100 characters or fewer.'),
  code: optionalFloorCode,
  floor_type: floorTypeSchema.optional().default('indoor'),
  is_active: z.boolean().optional(),
  description: optionalFloorDescription,
  sort_order: z.number().int().nonnegative().optional(),
});

export const createFloorFormSchema = z.object({
  name: requiredText('Floor name').max(100, 'Floor name must be 100 characters or fewer.'),
  code: z
    .string()
    .trim()
    .max(40, 'Floor code must be 40 characters or fewer.')
    .regex(/^[A-Za-z0-9-]*$/, 'Floor code can contain only letters, numbers, and hyphens.'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer.'),
  active: z.boolean(),
});

export const reorderFloorsSchema = z.object({
  items: z
    .array(
      z.object({
        floor_id: z.union([z.number().int().positive(), z.string().trim().min(1)]),
        sort_order: z.number().int().nonnegative(),
        version: versionField,
      }),
    )
    .min(1, 'At least one floor is required to reorder.'),
});

export const updateFloorSchema = z.object({
  name: requiredText('Floor name')
    .max(100, 'Floor name must be 100 characters or fewer.')
    .optional()
    .nullable(),
  code: optionalFloorCode,
  description: optionalFloorDescription,
  floor_type: floorTypeSchema.optional().nullable(),
  status: lifecycleStatusSchema.optional().nullable(),
  version: versionField,
  sort_order: z.number().int().nonnegative().nullable().optional(),
});

export const archiveEntitySchema = z.object({
  version: versionField,
  reason: z.string().trim().max(500).optional().nullable(),
});

export const createSectionSchema = z.object({
  name: requiredText('Section name').max(100, 'Section name must be 100 characters or fewer.'),
  code: optionalFloorCode,
  description: optionalFloorDescription,
  is_active: z.boolean().optional(),
  sort_order: z.number().int().nonnegative().optional(),
});

export const updateSectionSchema = z.object({
  name: requiredText('Section name')
    .max(100, 'Section name must be 100 characters or fewer.')
    .optional()
    .nullable(),
  code: optionalFloorCode,
  description: optionalFloorDescription,
  status: lifecycleStatusSchema.optional().nullable(),
  version: versionField,
  sort_order: z.number().int().nonnegative().nullable().optional(),
});

const tableNameField = requiredText('Table name').max(
  100,
  'Table name must be 100 characters or fewer.',
);

const tableShapeSchema = z.enum(['round', 'square', 'rectangle']);

const tableLifecycleStatusSchema = z.enum(['active', 'inactive', 'maintenance', 'archived'], {
  error: 'Status is required.',
});

export const createTableSchema = z
  .object({
    table_number: z.string().trim().min(1).optional(),
    name: tableNameField.optional(),
    description: optionalFloorDescription,
    capacity: z.number().int().positive('Capacity must be at least 1.').optional(),
    reservations_enabled: z.boolean().optional(),
    is_active: z.boolean().optional(),
    sort_order: z.number().int().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.table_number?.trim() && !data.name?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Table number is required.',
        path: ['table_number'],
      });
    }
  });

export const bulkCreateTableItemSchema = createTableSchema;
export const bulkCreateTablesSchema = z.preprocess(
  (value) => {
    if (value && typeof value === 'object' && 'tables' in value && !('items' in value)) {
      return { items: (value as { tables: unknown }).tables };
    }
    return value;
  },
  z.object({
    items: z.array(bulkCreateTableItemSchema).min(1, 'At least one table is required.'),
  }),
);

export const updateTableSchema = z.object({
  table_number: z.string().trim().min(1).optional(),
  name: tableNameField.optional().nullable(),
  description: optionalFloorDescription,
  capacity: z.number().int().positive('Capacity must be at least 1.').optional().nullable(),
  shape: tableShapeSchema.optional().nullable(),
  status: tableLifecycleStatusSchema.optional().nullable(),
  is_active: z.boolean().optional(),
  reservations_enabled: z.boolean().optional(),
  version: versionField,
  sort_order: z.number().int().nonnegative().nullable().optional(),
});

export const bulkUpdateTableItemSchema = updateTableSchema.extend({
  table_id: z.union([z.number().int().positive(), z.string().trim().min(1)]),
});

export const bulkUpdateTablesSchema = z.preprocess(
  (value) => {
    if (value && typeof value === 'object' && 'tables' in value && !('items' in value)) {
      const tables = (value as { tables: readonly Record<string, unknown>[] }).tables;
      return {
        items: tables.map((table) => ({
          ...table,
          table_id: table.table_id ?? table.id,
        })),
      };
    }
    return value;
  },
  z.object({
    items: z.array(bulkUpdateTableItemSchema).min(1, 'At least one table is required.'),
  }),
);
export const moveTableSchema = z.object({
  target_section_id: z.union([z.number().int().positive(), z.string().trim().min(1)]),
});
export const reorderTablesSchema = z.object({
  items: z
    .array(
      z.object({
        table_id: z.union([z.number().int().positive(), z.string().trim().min(1)]),
        sort_order: z.number().int().nonnegative(),
      }),
    )
    .min(1, 'At least one table is required to reorder.'),
});
export const combineTablesSchema = z.object({
  table_ids: z
    .array(z.union([z.number().int().positive(), z.string().trim().min(1)]))
    .min(2, 'Select at least two tables to combine.'),
});

export function getFloorValidationError(error: z.ZodError) {
  return firstZodError(error);
}

export type CreateFloorFormValues = z.infer<typeof createFloorFormSchema>;
export type CreateFloorSchemaValues = z.infer<typeof createFloorSchema>;
