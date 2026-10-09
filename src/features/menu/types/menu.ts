export type DietaryType = 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan';

export type OrderType = 'Delivery' | 'Take Away' | 'Dine In';

export type ExposeChannel = 'Captain App' | 'Online order' | 'Kiosk' | 'Other';

export type MenuItemStatus = 'Available' | 'Out of Stock' | 'Hidden';

export type ItemVariant = {
  id: string;
  size: string;
  price: number;
  status?: 'Active' | 'Inactive';
};

export type ItemModifier = {
  id: string;
  name: string;
  price: number;
};

export type ItemImage = {
  id: string;
  url: string;
  previewUrl?: string;
  storageKey?: string;
  mimeType?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  status?: 'Active' | 'Inactive';
};

export type MenuItemTag = {
  id: string;
  name: string;
  code: string;
  status?: 'Active' | 'Inactive';
};

export type MenuItemPreparationStation = {
  stationId: string;
  defaultOrder: number;
};

export type MenuItemModifierGroup = {
  groupId: string;
  displayOrder: number;
  overrideMinSelect?: number;
  overrideMaxSelect?: number;
};

export type MenuCategory = {
  id: string;
  name: string;
  parentId?: string;
  status?: 'Active' | 'Inactive';
  description?: string;
  displayOrder?: number;
  scope?: 'company' | 'branch';
  assignBranchId?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  scope?: 'company' | 'branch';
  assignBranchId?: string;
  assignBranchName?: string;
  onlineDisplayName?: string;
  code?: string;
  basePrice: number;
  profitMargin?: string;
  gst?: string;
  gstRateId?: string;
  dietary: DietaryType;
  orderTypes: OrderType[];
  exposeIn?: ExposeChannel[];
  tags?: string[];
  tagIds?: string[];
  variants?: ItemVariant[];
  modifiers?: ItemModifier[];
  preparationStations?: MenuItemPreparationStation[];
  modifierGroups?: MenuItemModifierGroup[];
  images?: ItemImage[];
  image?: string;
  description?: string;
  status?: MenuItemStatus;
  createdAt?: string;
};

export type CreateMenuItemInput = {
  name: string;
  categoryId: string;
  scope?: 'company' | 'branch';
  assignBranchId?: string | null;
  onlineDisplayName?: string;
  code?: string;
  basePrice: number;
  profitMargin?: string;
  gst?: string;
  /** Company GST catalog rate id (preferred over percent matching on create). */
  gstRateId?: string;
  dietary: DietaryType;
  orderTypes: OrderType[];
  exposeIn?: ExposeChannel[];
  tags?: string[];
  tagIds?: string[];
  variants?: ItemVariant[];
  modifiers?: ItemModifier[];
  preparationStations?: MenuItemPreparationStation[];
  modifierGroups?: MenuItemModifierGroup[];
  images?: ItemImage[];
  image?: string;
  imageFiles?: File[];
  description?: string;
};

export type CreateCategoryInput = {
  name: string;
  parentId?: string;
  status?: 'Active' | 'Inactive';
  description?: string;
  scope?: 'company' | 'branch';
  assignBranchId?: string;
};

export type MenuViewMode = 'list' | 'create-item' | 'edit-item' | 'create-category' | 'view-item';
