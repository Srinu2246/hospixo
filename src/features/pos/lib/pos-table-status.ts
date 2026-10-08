import { getTableStatusLabel, type TableStatus } from '@/features/pos/config/tables';

export type CompactTableStatusTone = 'available' | 'occupied' | 'reserved';

function getCompactTableStatusTone(status: TableStatus): CompactTableStatusTone {
  if (status === 'available' || status === 'cleaning') return 'available';
  if (status === 'billing') return 'occupied';
  return 'occupied';
}

export function getCompactTableStatus(status: TableStatus): {
  label: string;
  tone: CompactTableStatusTone;
} {
  return {
    label: getTableStatusLabel(status),
    tone: getCompactTableStatusTone(status),
  };
}
