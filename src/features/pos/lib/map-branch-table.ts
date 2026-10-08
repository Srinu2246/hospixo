import type { TableDto } from '@/features/floor-table-setup/types/floor-table';
import type { BranchTableView, TableOperationalStatus } from '@/features/pos/types/branch-tables';

/**
 * Map setup table DTO → operational view.
 * Order-backed status (occupied/billing) will replace this when POS orders API is wired.
 */
export function mapTableToBranchView(table: TableDto): BranchTableView {
  const operationalStatus: TableOperationalStatus =
    table.status === 'inactive' ? 'inactive' : 'vacant';

  return {
    id: table.id,
    floorId: table.floor_id,
    name: table.name,
    seats: table.seats,
    shape: table.shape ?? 'square',
    operationalStatus,
    sortOrder: table.sort_order ?? null,
  };
}

export function statusLabel(status: TableOperationalStatus): string {
  switch (status) {
    case 'vacant':
      return 'Vacant';
    case 'occupied':
      return 'Occupied';
    case 'billing':
      return 'Billing';
    case 'reserved':
      return 'Reserved';
    case 'inactive':
      return 'Inactive';
    default:
      return status;
  }
}

export function statusChipColor(
  status: TableOperationalStatus,
): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'vacant':
      return 'success';
    case 'occupied':
      return 'warning';
    case 'billing':
      return 'error';
    case 'reserved':
      return 'info';
    case 'inactive':
      return 'default';
    default:
      return 'default';
  }
}
