export type RestaurantMenuId = string;

export type RestaurantMenuApiStatus = 'active' | 'inactive';

export type RestaurantMenuTypeApi = 'all' | 'dine_in' | 'takeaway' | 'delivery' | 'online' | string;

export type RestaurantMenuApi = Readonly<{
  id: number;
  organization_id: number;
  company_id: number;
  name: string;
  code: string;
  description: string | null;
  menu_type: RestaurantMenuTypeApi;
  display_order: number;
  status: RestaurantMenuApiStatus;
  created_at: string;
  updated_at: string;
}>;

export type RestaurantMenuCreateScope = 'company' | 'branch' | 'both';

export type CreateRestaurantMenuApiRequest = Readonly<{
  name: string;
  code: string;
  description?: string;
  menu_type: RestaurantMenuTypeApi;
  display_order?: number;
  scope?: RestaurantMenuCreateScope;
  assign_branch_id?: number | null;
}>;

export type UpdateRestaurantMenuApiRequest = Readonly<{
  name?: string;
  code?: string;
  description?: string | null;
  menu_type?: RestaurantMenuTypeApi;
  display_order?: number;
  status?: RestaurantMenuApiStatus;
}>;

export type ListRestaurantMenusApiQuery = Readonly<{
  status?: RestaurantMenuApiStatus;
  menu_type?: RestaurantMenuTypeApi;
}>;

export type MenuCategoryAssignmentId = string;

export type MenuCategoryAssignmentApiStatus = 'active' | 'inactive';

export type MenuCategoryAssignmentApi = Readonly<{
  id: number;
  menu_id: number;
  category_id: number;
  display_order: number;
  status?: MenuCategoryAssignmentApiStatus;
  created_at: string;
  updated_at: string;
}>;

export type CreateMenuCategoryAssignmentApiRequest = Readonly<{
  category_id: number;
  display_order?: number;
}>;

export type UpdateMenuCategoryAssignmentApiRequest = Readonly<{
  display_order?: number;
  status?: MenuCategoryAssignmentApiStatus;
}>;

export type MenuTreeItemApi = Readonly<{
  id: number;
  name: string;
  code?: string;
  base_price?: number;
  status?: string;
  display_order?: number;
  image_url?: string | null;
  primary_image_url?: string | null;
  thumbnail_url?: string | null;
  dietary_type?: string | null;
  allow_dine_in?: boolean;
  allow_takeaway?: boolean;
  allow_delivery?: boolean;
  order_types?: readonly string[];
}>;

export type MenuTreeCategoryApi = Readonly<{
  assignment_id?: number;
  category_id?: number;
  name?: string;
  category?: Readonly<{
    id?: number;
    name?: string;
    items?: readonly MenuTreeItemApi[];
  }>;
  display_order?: number;
  status?: string;
  items?: readonly MenuTreeItemApi[];
  children?: readonly MenuTreeCategoryApi[];
}>;

export type MenuTreeApi = Readonly<{
  menu_id: number;
  menu?: RestaurantMenuApi;
  categories: readonly MenuTreeCategoryApi[];
}>;
