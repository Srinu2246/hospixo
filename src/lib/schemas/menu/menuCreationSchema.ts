import { z } from 'zod';

export const menuCreationScopeSchema = z.enum(['company', 'branch', 'organization']);

export const menuCategoryStatusSchema = z.enum(['Active', 'Inactive']);

export const dietaryTypeSchema = z.enum(['Veg', 'Non-Veg', 'Egg', 'Vegan']);

export const menuItemStatusSchema = z.enum(['Available', 'Out of Stock', 'Hidden']);

export const menuCreationViewModeSchema = z.enum([
  'list',
  'create-category',
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

export const menuCategoryListSchema = z.array(menuCategorySchema);
export const menuCatalogItemListSchema = z.array(menuCatalogItemSchema);

export type MenuCreationScope = z.infer<typeof menuCreationScopeSchema>;
export type MenuCreationViewMode = z.infer<typeof menuCreationViewModeSchema>;
export type MenuCategory = z.infer<typeof menuCategorySchema>;
export type MenuCatalogItem = z.infer<typeof menuCatalogItemSchema>;
export type MenuPageConfig = z.infer<typeof menuPageConfigSchema>;
export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;
