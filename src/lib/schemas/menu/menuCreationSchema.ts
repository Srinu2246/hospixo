import { z } from 'zod';

export const menuCreationScopeSchema = z.enum(['company', 'branch', 'organization']);

export const menuCategoryStatusSchema = z.enum(['Active', 'Inactive']);

export const dietaryTypeSchema = z.enum(['Veg', 'Non-Veg', 'Egg', 'Vegan']);

export const menuItemStatusSchema = z.enum([
  'Available',
  'Out of Stock',
  'Hidden',
  'Active',
  'Inactive',
]);

export const menuCreationViewModeSchema = z.enum([
  'list',
  'create-category',
  'edit-category',
  'create-item',
  'edit-item',
  'view-item',
]);

export const menuCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: menuCategoryStatusSchema,
  description: z.string().optional(),
  displayOrder: z.number().int(),
  parentId: z.number().int().nullable().optional(),
});

export const menuCatalogItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  basePrice: z.number().min(0),
  dietary: dietaryTypeSchema,
  status: menuItemStatusSchema,
  code: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  orderTypes: z.array(z.string()),
  tags: z.array(z.string()).default([]),
});

export const menuPageConfigSchema = z.object({
  scope: menuCreationScopeSchema,
  canManageCategories: z.boolean(),
  homeHref: z.string().min(1),
  pageTitle: z.string().min(1),
  pageSubtitle: z.string().min(1),
});

export const createCategoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Category name is required'),
  description: z.string().trim().optional(),
});

export const variantItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Variant name is required'),
  price: z.number().min(0, 'Price must be positive'),
});

export const modifierItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Modifier name is required'),
  price: z.number().min(0, 'Price must be positive'),
  /** Catalog modifier group id — required for POST modifier_groups. */
  modifierGroupId: z.number().int().positive().optional(),
});

export const createMenuItemFormSchema = z.object({
  category: z.string().trim().min(1, 'Category is required'),
  name: z.string().trim().min(1, 'Item name is required'),
  onlineDisplayName: z.string().trim().optional(),
  code: z.string().trim().min(1, 'Item code is required'),
  itemPrice: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .refine((val) => !isNaN(val) && val >= 0, 'Item price must be 0 or greater'),
  profitMargin: z.string().trim().optional(),
  gst: z.string().trim().optional(),
  description: z.string().trim().optional(),
  dietaryType: z.enum(['Veg', 'Non-Veg', 'Egg']),
  orderTypes: z.array(z.string()).min(1, 'Select at least one order type'),
  exposedIn: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  variants: z.array(variantItemSchema).default([]),
  modifiers: z.array(modifierItemSchema).default([]),
});

export type MenuCreationScope = z.infer<typeof menuCreationScopeSchema>;
export type MenuCreationViewMode = z.infer<typeof menuCreationViewModeSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type MenuCatalogItem = z.infer<typeof menuCatalogItemSchema>;
export type MenuPageConfig = z.infer<typeof menuPageConfigSchema>;
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
export type VariantItem = z.infer<typeof variantItemSchema>;
export type ModifierItem = z.infer<typeof modifierItemSchema>;
export type CreateMenuItemFormValues = z.infer<typeof createMenuItemFormSchema>;

/** Create-item submit payload (form + optional upload file). */
export type CreateMenuItemSubmitValues = CreateMenuItemFormValues & {
  imageFile?: File | null;
  /** Lowercase tag label → tag definition id (from POST item-tags or existing items). */
  tagIdsByName?: Record<string, number>;
};
