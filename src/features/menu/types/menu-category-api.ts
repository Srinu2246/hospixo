export type MenuCategoryApiStatus = 'active' | 'inactive';

export type MenuCategoryScope = 'company' | 'branch';

export type MenuCategoryApi = Readonly<{
  id: number;
  organization_id: number;
  company_id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  display_order: number;
  scope?: MenuCategoryScope;
  assign_branch_id?: number | null;
  status: MenuCategoryApiStatus;
  created_at: string;
  updated_at: string;
}>;

export type CreateMenuCategoryApiRequest = Readonly<{
  name: string;
  description?: string;
  parent_id?: number | null;
  display_order?: number;
  scope: MenuCategoryScope;
  assign_branch_id?: number | null;
}>;

export type UpdateMenuCategoryApiRequest = Readonly<{
  name?: string;
  description?: string | null;
  parent_id?: number | null;
  display_order?: number;
  scope?: MenuCategoryScope;
  assign_branch_id?: number | null;
}>;
