import type { KitchenOrder, KitchenOrderItem } from '@/features/kitchen/types';
import { defaultKitchenStations } from '@/features/kitchen/config/stations';
import type { DineInOrderLine } from '@/features/pos/config/dine-in';

function mapLineCategory(_line: DineInOrderLine): KitchenOrderItem['category'] {
  return 'other';
}

export function dineInLinesToKitchenItems(lines: readonly DineInOrderLine[]): KitchenOrderItem[] {
  return lines.map((line) => ({
    id: line.id,
    name: line.name,
    quantity: line.quantity,
    category: mapLineCategory(line),
  }));
}

export function createKitchenOrderFromKot(input: {
  id: string;
  orderNumber: string;
  tableLabel: string;
  lines: readonly DineInOrderLine[];
}): KitchenOrder {
  const stationId = defaultKitchenStations[0]?.id ?? 'main-kitchen';
  const number = input.orderNumber.replace(/^#/, '');

  return {
    id: input.id,
    number,
    status: 'new',
    priority: 'normal',
    channel: 'dine_in',
    tableLabel: input.tableLabel.replace(/^Table\s+/i, ''),
    stationId,
    placedAt: new Date().toISOString(),
    items: dineInLinesToKitchenItems(input.lines),
  };
}
