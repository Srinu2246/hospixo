import type { DineInOrderLine } from '@/features/pos/config/dine-in';
import { normalizeTableId } from '@/features/pos/config/tables';

export const INITIAL_ORDER_SEQUENCE = 1;

export function createMenuQuantitiesFromLines(
  lines: readonly DineInOrderLine[],
): Record<string, number> {
  return lines.reduce<Record<string, number>>((acc, line) => {
    if (line.menuItemId) {
      acc[line.menuItemId] = (acc[line.menuItemId] ?? 0) + line.quantity;
    }
    return acc;
  }, {});
}

export function formatPosOrderNumber(sequence: number) {
  return `#${String(sequence).padStart(4, '0')}`;
}

export function getTableLabel(
  tableId: string,
  tables: readonly { id: string; label: string }[] = [],
  explicitLabel?: string,
) {
  if (explicitLabel?.trim()) return explicitLabel;
  const table =
    tables.find((entry) => normalizeTableId(entry.id) === normalizeTableId(tableId)) ?? null;
  if (!table) return tableId ? `Table ${table.label}` : '—';
  const number = table.label.replace(/^T-?/i, '').padStart(2, '0');
  return `Table ${number}`;
}

export function getTableNumber(
  tableId: string,
  tables: readonly { id: string; label: string }[] = [],
  explicitLabel?: string,
) {
  if (explicitLabel?.trim()) {
    return explicitLabel.replace(/^T-?/i, '');
  }
  const table =
    tables.find((entry) => normalizeTableId(entry.id) === normalizeTableId(tableId)) ?? null;
  return table?.label.replace(/^T-?/i, '') ?? '—';
}

export function getEmptyPosOrderState() {
  return {
    selectedTableId: '',
    selectedTableLabel: '',
    orderLines: [] as DineInOrderLine[],
    menuQuantities: {} as Record<string, number>,
  };
}
