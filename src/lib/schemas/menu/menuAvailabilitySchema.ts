import { z } from 'zod';

export const menuAvailabilityScopeSchema = z.enum(['company', 'branch', 'organization']);

export const availabilityChannelGroupSchema = z.enum(['all', 'online', 'dine-in-qr']);

export const itemAvailabilityMarkSchema = z.enum(['available', '86d']);

export const itemVisibilitySchema = z.enum(['online', 'hidden', 'dine-in']);

export const dietaryTypeSchema = z.enum(['Veg', 'Non-Veg', 'Egg', 'Vegan']);

export const availabilityCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displayOrder: z.number().int(),
});

export const availabilityItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
  dietary: dietaryTypeSchema,
  mark: itemAvailabilityMarkSchema,
  visibility: itemVisibilitySchema,
  tag: z.string().min(1),
  isHidden: z.boolean().default(false),
});

export const availabilityChannelSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  group: availabilityChannelGroupSchema,
});

export const menuAvailabilityPageConfigSchema = z.object({
  scope: menuAvailabilityScopeSchema,
  homeHref: z.string().min(1),
  pageTitle: z.string().min(1),
  pageSubtitle: z.string().min(1),
  syncLabel: z.string().min(1),
});

export const availabilityCategoryListSchema = z.array(availabilityCategorySchema);
export const availabilityItemListSchema = z.array(availabilityItemSchema);
export const availabilityChannelListSchema = z.array(availabilityChannelSchema);

export type MenuAvailabilityScope = z.infer<typeof menuAvailabilityScopeSchema>;
export type AvailabilityChannelGroup = z.infer<typeof availabilityChannelGroupSchema>;
export type ItemAvailabilityMark = z.infer<typeof itemAvailabilityMarkSchema>;
export type AvailabilityCategory = z.infer<typeof availabilityCategorySchema>;
export type AvailabilityItem = z.infer<typeof availabilityItemSchema>;
export type AvailabilityChannel = z.infer<typeof availabilityChannelSchema>;
export type MenuAvailabilityPageConfig = z.infer<typeof menuAvailabilityPageConfigSchema>;
