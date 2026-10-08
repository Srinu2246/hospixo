import type { MenuItemId } from './menu-item-api';

export type MenuItemVariantId = string;

export type MenuItemVariantApiStatus = 'active' | 'inactive';

export type ListMenuItemVariantsApiQuery = Readonly<{
  status?: MenuItemVariantApiStatus;
}>;

export type MenuItemVariantApi = Readonly<{
  id: number;
  menu_item_id?: number;
  item_id?: number;
  organization_id?: number;
  company_id?: number;
  catalogue_scope?: 'company' | 'branch';
  branch_id?: number | null;
  name: string;
  price_adjustment: number;
  final_price?: number;
  display_order: number;
  sku: string | null;
  is_default: boolean;
  status: MenuItemVariantApiStatus;
  created_at: string;
  updated_at: string;
}>;

export type CreateMenuItemVariantApiRequest = Readonly<{
  name: string;
  price_adjustment: number;
  display_order?: number;
  sku?: string;
  is_default?: boolean;
  scope: 'company' | 'branch';
  assign_branch_id: number | null;
}>;

export type UpdateMenuItemVariantApiRequest = Partial<CreateMenuItemVariantApiRequest>;

export type CreateMenuItemVariantOptions = Readonly<{
  itemId: MenuItemId;
  body: CreateMenuItemVariantApiRequest;
  idempotencyKey?: string;
}>;
