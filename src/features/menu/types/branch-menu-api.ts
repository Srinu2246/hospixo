import type { MenuTreeApi, RestaurantMenuApi } from './restaurant-menu-api';

export type BranchMenuAssignmentStatus = 'active' | 'inactive';

export type BranchMenuAssignmentApi = Readonly<{
  id: number;
  branch_id: number;
  menu_id: number;
  display_order: number;
  is_default: boolean;
  status: BranchMenuAssignmentStatus;
  menu?: RestaurantMenuApi;
  created_at?: string;
  updated_at?: string;
}>;

export type AssignBranchMenuApiRequest = Readonly<{
  menu_id: number;
  display_order?: number;
  is_default?: boolean;
}>;

export type UpdateBranchMenuApiRequest = Readonly<{
  display_order?: number;
  is_default?: boolean;
  status?: BranchMenuAssignmentStatus;
}>;

export type ListBranchMenusApiQuery = Readonly<{
  status?: BranchMenuAssignmentStatus;
}>;

export type BranchMenuTreeApiQuery = Readonly<{
  category_id?: number;
}>;

export type BranchMenuTreeApi = MenuTreeApi;
