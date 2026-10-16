import type { RestaurantMenuType } from '@/features/menu/types/restaurant-menu';

export type BranchMenuAssignment = Readonly<{
  id: string;
  branchId: string;
  menuId: string;
  menuName?: string;
  menuCode?: string;
  menuType?: RestaurantMenuType;
  displayOrder: number;
  isDefault: boolean;
  status: 'Active' | 'Inactive' | string;
}>;
