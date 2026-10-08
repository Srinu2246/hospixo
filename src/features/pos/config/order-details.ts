import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import { posFoodImages } from '@/features/pos/config/assets';

export const orderDetailsPageMeta = {
  orderedItemsLabel: 'Ordered Items',
  subtotalLabel: 'Subtotal',
  taxLabel: 'Tax (5% GST)',
  grandTotalLabel: 'Grand Total',
  itemsLabel: 'Items',
  orderedAgoPrefix: 'Ordered',
  waiterPrefix: 'Waiter',
} as const;

/** Billing rates — adjust here instead of scattering in components. */
export const orderDetailsBilling = {
  taxRate: 0.05,
} as const;

export function computeOrderSubtotal(lines: readonly DineInOrderLine[]) {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function computeOrderTax(subtotal: number) {
  return Math.round(subtotal * orderDetailsBilling.taxRate * 100) / 100;
}

export function computeOrderGrandTotal(subtotal: number) {
  return subtotal + computeOrderTax(subtotal);
}

/** Demo lines for seeded open order #1042 / Table T4 (order-details mock). */
export const orderDetailsSeedLines: DineInOrderLine[] = [
  {
    id: 'od-l1',
    menuItemId: 'butter-chicken',
    name: 'Butter Chicken',
    price: 320,
    quantity: 2,
    imageUrl: posFoodImages.chickenBiryani,
  },
  {
    id: 'od-l2',
    menuItemId: 'garlic-naan',
    name: 'Garlic Naan',
    price: 60,
    quantity: 2,
    imageUrl: posFoodImages.margheritaPizza,
  },
  {
    id: 'od-l3',
    menuItemId: 'dal-makhani',
    name: 'Dal Makhani',
    price: 220,
    quantity: 1,
    imageUrl: posFoodImages.tomatoSoup,
  },
  {
    id: 'od-l4',
    menuItemId: 'jeera-rice',
    name: 'Jeera Rice',
    price: 180,
    quantity: 2,
    imageUrl: posFoodImages.chickenBiryani,
  },
  {
    id: 'od-l5',
    menuItemId: 'masala-papad',
    name: 'Masala Papad',
    price: 80,
    quantity: 2,
    imageUrl: posFoodImages.caesarSalad,
  },
  {
    id: 'od-l6',
    menuItemId: 'lassi',
    name: 'Lassi',
    price: 120,
    quantity: 4,
    imageUrl: posFoodImages.lemonade,
  },
];
