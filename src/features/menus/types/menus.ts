import type { MenuCategory } from '@/features/menu/types/menu';

export type MenuSessionStatus = 'active' | 'inactive';

export type MenuSessionType = 'All' | 'Dine-In' | 'Takeaway' | 'Delivery';

export type MenuSessionForm = {
  name: string;
  code: string;
  menuType: MenuSessionType | '';
  description: string;
};

export type MenuSession = {
  id: string;
  name: string;
  code: string;
  menuType: MenuSessionType;
  description: string;
  status: MenuSessionStatus;
  startTime: string;
  endTime: string;
  daysLabel: string;
  assignedItemIds: string[];
  updatedAt: string;
};

export type MenuCatalogCategory = {
  id: string;
  name: string;
};

export type MenuCatalogItem = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  dietary: 'Veg' | 'Non-Veg';
  orderTypesLabel: string;
  image: string;
  categoryAssignmentId?: string;
  assignmentId?: string;
  imagePending?: boolean;
};

export type CompanyMenusPageData = Readonly<{
  sessions: MenuSession[];
  sourceCategories: MenuCategory[];
}>;
