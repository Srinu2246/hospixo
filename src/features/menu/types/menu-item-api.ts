export type MenuItemDietaryTypeApi = 'veg' | 'non_veg' | 'egg';

export type MenuItemId = string;

export type MenuItemTaxApi = Readonly<{
  gst_rate_id: number;
  is_inclusive: boolean;
}>;

export type MenuItemPreparationStationApi = Readonly<{
  preparation_station_id: number;
  default_order: number;
}>;

export type MenuItemModifierGroupApi = Readonly<{
  modifier_group_id: number;
  override_min_select?: number;
  override_max_select?: number;
  display_order?: number;
}>;

export type MenuItemApiStatus = 'active' | 'inactive';

export type ListMenuItemsApiQuery = Readonly<{
  status?: MenuItemApiStatus;
  category_id?: number;
  dietary_type?: MenuItemDietaryTypeApi;
}>;

export type MenuItemApiScope = 'company' | 'branch';

export type MenuItemApi = Readonly<{
  id: number;
  organization_id: number;
  company_id: number;
  catalogue_scope?: MenuItemApiScope;
  branch_id?: number | null;
  category_id: number;
  name: string;
  code: string;
  base_price: number;
  profit_margin_percent: number;
  allow_dine_in: boolean;
  allow_takeaway: boolean;
  allow_delivery: boolean;
  expose_captain_app: boolean;
  is_favorite: boolean;
  is_combo: boolean;
  dietary_type: MenuItemDietaryTypeApi;
  description: string | null;
  sku: string | null;
  barcode: string | null;
  status: MenuItemApiStatus;
  taxes: MenuItemTaxApi[];
  preparation_stations: MenuItemPreparationStationApi[];
  modifier_groups: MenuItemModifierGroupApi[];
  tag_ids: number[];
  created_at: string;
  updated_at: string;
}>;

export type CreateMenuItemApiRequest = Readonly<{
  name: string;
  code: string;
  category_id: number;
  taxes?: MenuItemTaxApi[];
  preparation_stations?: MenuItemPreparationStationApi[];
  modifier_groups?: MenuItemModifierGroupApi[];
  base_price: number;
  profit_margin_percent?: number;
  allow_dine_in?: boolean;
  allow_takeaway?: boolean;
  allow_delivery?: boolean;
  expose_captain_app?: boolean;
  is_favorite?: boolean;
  is_combo?: boolean;
  tag_ids?: number[];
  dietary_type: MenuItemDietaryTypeApi;
  description?: string;
  sku?: string;
  barcode?: string;
  scope: MenuItemApiScope;
  assign_branch_id: number | null;
}>;

export type UpdateMenuItemApiRequest = Partial<CreateMenuItemApiRequest>;
