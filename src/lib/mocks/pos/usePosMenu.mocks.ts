/**
 * POS cart / menu card view models.
 * Catalog rows come from `@/lib/mocks/menu/useMenuCreation.mocks` via the restaurant menu API.
 */

export interface ItemSizeOption {
  id: string;
  name: string;
  price: number;
}

export interface ItemAddOnOption {
  id: string;
  name: string;
  price: number;
}

export type CookingPreference = 'Mild' | 'Medium' | 'Spicy';

export interface PosMenuItem {
  id: string;
  name: string;
  /** Restaurant menu category id (stringified). */
  category: string;
  categorySection: string;
  basePrice: number;
  imageUrl?: string;
  isPopular?: boolean;
  sizes: ItemSizeOption[];
  addOns: ItemAddOnOption[];
  cookingPreferences: CookingPreference[];
}

export interface CartCustomization {
  selectedSizes: ItemSizeOption[];
  selectedAddOns: ItemAddOnOption[];
  cookingPreference: CookingPreference;
}

export interface CartItem {
  cartId: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
  customization?: CartCustomization;
  itemBadges?: string[];
  isExisting?: boolean;
  disableDelete?: boolean;
  originalQuantity?: number;
  /** Server order line id — DELETE …/orders/{order_id}/items/{item_id}. */
  orderLineId?: number;
}

/** Demo cart seed for takeaway / occupied-table flows. */
export const INITIAL_CART_ITEMS: CartItem[] = [
  {
    cartId: 'cart-1',
    menuItemId: '1',
    name: 'Paneer Tikka',
    basePrice: 249,
    unitPrice: 249,
    quantity: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1567184109411-b28f2700e1e5?w=600&auto=format&fit=crop&q=80',
    itemBadges: ['2 Items', 'Regular'],
  },
  {
    cartId: 'cart-2',
    menuItemId: '2',
    name: 'Chicken Tikka',
    basePrice: 299,
    unitPrice: 299,
    quantity: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    itemBadges: ['1 Item', '6 Pcs'],
  },
];
