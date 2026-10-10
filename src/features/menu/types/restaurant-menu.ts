export type RestaurantMenuType = 'All' | 'Dine In' | 'Takeaway' | 'Delivery' | 'Online';

export type RestaurantMenuScope = 'company' | 'branch' | 'both';

export type RestaurantMenu = {
  id: string;
  name: string;
  code: string;
  description?: string;
  menuType: RestaurantMenuType;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  scope?: RestaurantMenuScope;
  assignBranchId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateRestaurantMenuInput = {
  name: string;
  code: string;
  description?: string;
  menuType: RestaurantMenuType;
  displayOrder?: number;
  scope?: RestaurantMenuScope;
  assignBranchId?: string | number | null;
};

export type MenuCategoryAssignment = {
  id: string;
  menuId: string;
  categoryId: string;
  categoryName?: string;
  displayOrder: number;
  status?: 'Active' | 'Inactive';
};

export type MenuTreeItem = {
  id: string;
  name: string;
  code?: string;
  basePrice?: number;
  status?: string;
  displayOrder?: number;
  imageUrl?: string;
  dietary?: string;
  orderTypes?: string[];
};

export type MenuTreeCategory = {
  assignmentId?: string;
  categoryId: string;
  name: string;
  displayOrder?: number;
  status?: string;
  items: MenuTreeItem[];
  children: MenuTreeCategory[];
};

export type MenuTree = {
  menuId: string;
  menu?: RestaurantMenu;
  categories: MenuTreeCategory[];
};

export type MenusViewMode = 'list' | 'create-menu' | 'edit-menu' | 'view-menu';
