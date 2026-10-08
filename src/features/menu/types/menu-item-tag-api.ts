export type MenuItemTagDefinitionId = string; // NOSONAR

export type MenuItemTagApiStatus = 'active' | 'inactive';

export type ListMenuItemTagsApiQuery = Readonly<{
  status?: MenuItemTagApiStatus;
}>;

export type MenuItemTagApi = Readonly<{
  id: number;
  organization_id: number;
  company_id: number;
  name: string;
  code: string;
  status: MenuItemTagApiStatus;
  created_at: string;
  updated_at: string;
}>;

export type CreateMenuItemTagApiRequest = Readonly<{
  name: string;
  code: string;
}>;

export type UpdateMenuItemTagApiRequest = Readonly<{
  name?: string;
  code?: string;
  status?: MenuItemTagApiStatus;
}>;
