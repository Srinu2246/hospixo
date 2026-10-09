import type { MenuItemApi } from '@/features/menu/types/menu-item-api';

export type BranchMenuItemOverrideId = string;

export type BranchMenuItemOverrideStatus = 'active' | 'inactive';

export type BranchMenuItemOverrideMenuItemApi = Pick<
  MenuItemApi,
  'id' | 'name' | 'code' | 'base_price' | 'dietary_type' | 'status' | 'category_id'
>;

export type BranchMenuItemOverrideApi = Readonly<{
  id: number;
  branch_menu_assignment_id: number;
  menu_item_id: number;
  selling_price?: number | null;
  is_available?: boolean;
  allow_dine_in?: boolean;
  allow_takeaway?: boolean;
  allow_delivery?: boolean;
  display_order?: number;
  status?: BranchMenuItemOverrideStatus | string;
  is_active?: boolean;
  menu_item?: BranchMenuItemOverrideMenuItemApi;
  created_at?: string;
  updated_at?: string;
}>;

export type ListBranchMenuItemsApiQuery = Readonly<{
  status?: BranchMenuItemOverrideStatus;
  page?: number;
  page_size?: number;
}>;

export type UpdateBranchMenuItemOverrideApiRequest = Readonly<{
  selling_price?: number | null;
  is_available?: boolean | null;
  allow_dine_in?: boolean | null;
  allow_takeaway?: boolean | null;
  allow_delivery?: boolean | null;
  display_order?: number | null;
  status?: BranchMenuItemOverrideStatus | null;
}>;

export type BranchMenuItemResponse = BranchMenuItemOverrideApi;
export type BranchMenuItemUpdateRequest = UpdateBranchMenuItemOverrideApiRequest;

export type PagedItemsResponse<T> = Readonly<{
  items: T[];
  total?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}>;

// Branch Menu Item Variants ---------------------------------------------------

export type BranchMenuItemVariantSummary = Readonly<{
  id: number;
  name: string;
  sku?: string | null;
  price_adjustment: string;
  is_default: boolean;
  status: BranchMenuItemOverrideStatus | string;
}>;

export type BranchMenuItemVariantResponse = Readonly<{
  id: number;
  organization_id?: number;
  company_id?: number;
  branch_id?: number;
  branch_menu_item_id?: number;
  menu_item_id?: number;
  menu_item_variant_id?: number;
  price_adjustment?: string | null;
  effective_price_adjustment?: string;
  effective_final_price?: string;
  is_available: boolean;
  display_order: number;
  status: BranchMenuItemOverrideStatus | string;
  variant?: BranchMenuItemVariantSummary;
  created_at?: string | null;
  updated_at?: string | null;
}>;

export type BranchMenuItemVariantUpdateRequest = Readonly<{
  price_adjustment?: number | string | null;
  is_available?: boolean | null;
  display_order?: number | null;
  status?: BranchMenuItemOverrideStatus | null;
}>;

export type ListBranchMenuItemVariantsApiQuery = Readonly<{
  status?: BranchMenuItemOverrideStatus;
  page?: number;
  page_size?: number;
}>;

// Branch Menu Item Modifiers --------------------------------------------------

export type BranchMenuItemModifierOptionSummary = Readonly<{
  id: number;
  name: string;
  modifier_group_id: number;
  price_delta: number;
  status: BranchMenuItemOverrideStatus | string;
  group_name?: string | null;
  group_status?: BranchMenuItemOverrideStatus | string | null;
}>;

export type BranchMenuItemModifierOptionResponse = Readonly<{
  id: number;
  organization_id?: number;
  company_id?: number;
  branch_id?: number;
  branch_menu_item_id?: number;
  modifier_option_id?: number;
  price_delta?: number | null;
  effective_price_delta?: number;
  is_available: boolean;
  display_order: number;
  status: BranchMenuItemOverrideStatus | string;
  option?: BranchMenuItemModifierOptionSummary;
  created_at?: string | null;
  updated_at?: string | null;
}>;

export type BranchMenuItemModifierOptionUpdateRequest = Readonly<{
  price_delta?: number | null;
  is_available?: boolean | null;
  display_order?: number | null;
  status?: BranchMenuItemOverrideStatus | null;
}>;

export type ListBranchMenuItemModifiersApiQuery = Readonly<{
  status?: BranchMenuItemOverrideStatus;
  page?: number;
  page_size?: number;
}>;
