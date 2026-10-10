import type { MenuTree, RestaurantMenuType } from './restaurant-menu';

export type BranchMenuAssignment = Readonly<{
  id: string;
  branchId: string;
  menuId: string;
  menuName?: string;
  menuCode?: string;
  menuType?: RestaurantMenuType;
  displayOrder: number;
  isDefault: boolean;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}>;

export type BranchMenuTree = MenuTree;
