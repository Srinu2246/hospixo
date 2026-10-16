export type PublicRestaurantMenuLocation = Readonly<{
  branch_name: string;
  floor_name: string;
  section_name: string;
}>;

export type PublicRestaurantMenuInfo = Readonly<{
  name: string;
  description: string;
}>;

export type PublicRestaurantMenuVariant = Readonly<{
  name: string;
  is_default: boolean;
  effective_final_price: number;
  display_order: number;
}>;

export type PublicRestaurantMenuModifierOption = Readonly<{
  name: string;
  effective_price_delta: number;
  display_order: number;
}>;

export type PublicRestaurantMenuModifierGroup = Readonly<{
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  display_order: number;
  options: readonly PublicRestaurantMenuModifierOption[];
}>;

export type PublicRestaurantMenuItemImage = Readonly<{
  url: string;
  mime_type: string;
  sort_order: number;
  is_primary: boolean;
}>;

export type PublicRestaurantMenuDietaryType = 'veg' | 'non_veg' | 'egg' | 'vegan';

export type PublicRestaurantMenuItem = Readonly<{
  name: string;
  description: string;
  dietary_type: PublicRestaurantMenuDietaryType;
  effective_price: number;
  variants: readonly PublicRestaurantMenuVariant[];
  modifier_groups: readonly PublicRestaurantMenuModifierGroup[];
  images: readonly PublicRestaurantMenuItemImage[];
}>;

export type PublicRestaurantMenuCategory = Readonly<{
  name: string;
  description: string;
  display_order: number;
  items: readonly PublicRestaurantMenuItem[];
}>;

export type PublicRestaurantMenuData = Readonly<{
  location: PublicRestaurantMenuLocation;
  menu: PublicRestaurantMenuInfo;
  currency: string;
  categories: readonly PublicRestaurantMenuCategory[];
}>;

export type PublicRestaurantMenuQuery = Readonly<{
  floor_id: number;
  section_id: number;
  branch_id: number;
  menu_id: number;
}>;
