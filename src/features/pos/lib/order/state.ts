import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import { dineInInitialOrderLines } from '@/features/pos/config/dine-in';
import { normalizeTableId, posTables } from '@/features/pos/config/tables';

export const INITIAL_ORDER_SEQUENCE = 39;

const defaultTable = posTables.find((entry) => entry.status === 'occupied') ?? posTables[0];

export const dineInDefaultTableId = defaultTable?.id ?? '';

export function createMenuQuantitiesFromLines(
  lines: readonly DineInOrderLine[],
): Record<string, number> {
  return lines.reduce<Record<string, number>>((acc, line) => {
    if (line.menuItemId) {
      acc[line.menuItemId] = line.quantity;
    }
    return acc;
  }, {});
}

export function formatPosOrderNumber(sequence: number) {
  return `#${String(sequence).padStart(4, '0')}`;
}

export function getTableLabel(tableId: string) {
  const table =
    posTables.find((entry) => normalizeTableId(entry.id) === normalizeTableId(tableId)) ?? null;
  if (!table) return '—';
  const number = table.label.replace(/^T-?/i, '').padStart(2, '0');
  return `Table ${number}`;
}

export function getTableNumber(tableId: string) {
  const table =
    posTables.find((entry) => normalizeTableId(entry.id) === normalizeTableId(tableId)) ?? null;
  return table?.label.replace(/^T-?/i, '') ?? '—';
}

export function getDemoPosOrderState() {
  return {
    selectedTableId: dineInDefaultTableId,
    orderLines: [...dineInInitialOrderLines],
    menuQuantities: createMenuQuantitiesFromLines(dineInInitialOrderLines),
  };
}

export function getEmptyPosOrderState() {
  return {
    selectedTableId: dineInDefaultTableId,
    orderLines: [] as DineInOrderLine[],
    menuQuantities: {} as Record<string, number>,
  };
}
