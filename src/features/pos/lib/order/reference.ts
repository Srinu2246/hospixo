import { normalizeTableId, posTables } from '@/features/pos/config/tables';

/** Parse `Table T4` / `T4` style references into normalized table ids. */
export function resolveTableIdFromReference(reference: string): string | null {
  const match = reference.match(/(?:table\s*)?T-?(\d+)/i);
  if (!match?.[1]) return null;
  return normalizeTableId(`t${match[1]}`);
}

export function buildTableReference(tableId: string) {
  const table = posTables.find((entry) => normalizeTableId(entry.id) === normalizeTableId(tableId));
  return table ? `Table ${table.label}` : `Table ${tableId}`;
}
