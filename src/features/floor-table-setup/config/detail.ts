import type {
  HistoryActionFilter,
  HistoryActionId,
  HistorySubTabId,
  SectionStatus,
  SectionStatusFilter,
  TableConfigStatus,
  TableConfigStatusFilter,
  TableShape,
  TableViewId,
} from '@/features/floor-table-setup/types/floor-table-setup';

export const detailCopy = {
  floorDetailsTitle: 'Floor Details',
  updateFloor: 'Update Floor',
  sectionsTitle: 'Sections List',
  sectionsSubtitle: 'Manage and organize dining zones within this floor',
  searchSections: 'Search sections...',
  addSection: 'Add Section',
  sectionSuffix: 'Section',
  tablesInSection: 'Tables in this Section',
  editSection: 'Edit Section',
  saveChanges: 'Save Changes',
  cancel: 'Cancel',
  back: 'Back',
  edit: 'Edit',
  deleteSection: 'Delete section',
  deleteTable: 'Delete table',
  close: 'Close',
  tablesTitle: 'Tables List',
  tablesSubtitle: 'Manage and view configuration of layout tables',
  addTable: 'Add Table',
  searchTables: 'Search tables...',
  bulkEdit: 'Bulk Edit',
  selectedCount: (count: number) => `${count} Table${count === 1 ? '' : 's'} Selected`,
  clearSelection: 'Deselect All',
  setupPermissions: 'Setup Permissions',
  editTableTitle: 'Edit Table',
  bulkEditTitle: 'Bulk Edit Tables',
  bulkEditSubtitle: 'Apply the same settings to every selected table',
  startNumber: 'Start Number',
  endNumber: 'End Number',
  tableNumber: 'Table Number',
  area: 'Area',
  capacity: 'Capacity',
  shape: 'Shape',
  tableType: 'Type',
  status: 'Status',
  reservations: 'Reservations',
  reservationsHint: 'Set permissions for accepting and managing reservations',
  apply: 'Apply',
  combineTables: 'Combine Tables',
  splitCombination: 'Split Combination',
  rotateQr: 'Rotate QR',
  historyTitle: 'Floor History Log',
  historySubtitle: 'Track configuration and table-status changes for this floor',
  export: 'Export',
  searchHistory: 'Search history...',
  dateLabel: 'Date',
  actionLabel: 'Action',
  previousPage: 'Previous',
  nextPage: 'Next',
  pageLabel: (page: number, total: number) => `Page ${page} of ${total}`,
  missingFloorTitle: 'Floor not found',
  missingFloorDescription:
    'This floor is not available. Go back to the setup list and open a floor card again.',
  errorTitle: 'Something Went Wrong',
  errorDescription:
    "We couldn't load your floor management data. Please verify your connection and try again.",
  retry: 'Retry Connection',
  goBack: 'Go Back',
  emptySectionsTitle: 'No Sections Created Yet',
  emptySectionsDescription:
    'Organize your floor by creating sections to group tables and manage dining areas.',
  emptyTablesTitle: 'No Tables Yet',
  emptyTablesDescription: 'Add tables to this floor to manage seating, layouts, and guest orders.',
  emptyHistory: 'No history matches the current filters.',
  labels: {
    sectionName: 'Section Name',
    sectionCode: 'Section Code',
    status: 'Status',
    description: 'Description',
    tables: 'Tables',
    seats: 'Seats',
    activeTables: 'Active Tables',
    inactiveTables: 'Inactive Tables',
  },
  historyStats: {
    reserved: 'Reserved',
    occupied: 'Occupied',
    notReserved: 'Not Reserved',
  },
} as const;

export const sectionStatusLabels: Record<SectionStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const sectionStatusFilterOptions: ReadonlyArray<{
  id: SectionStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'Status' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

export const tableConfigStatusLabels: Record<TableConfigStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export const tableShapeLabels: Record<TableShape, string> = {
  round: 'Round',
  square: 'Square',
  rectangle: 'Rectangle',
};

export const tableShapeOptions = Object.entries(tableShapeLabels).map(([id, label]) => ({
  id: id as TableShape,
  label,
}));

export const tableConfigStatusOptions = Object.entries(tableConfigStatusLabels).map(
  ([id, label]) => ({ id: id as TableConfigStatus, label }),
);

export const tableConfigStatusFilterOptions: ReadonlyArray<{
  id: TableConfigStatusFilter;
  label: string;
}> = [{ id: 'all', label: 'Status' }, ...tableConfigStatusOptions];

export const tableViewOptions: ReadonlyArray<{ id: TableViewId; label: string }> = [
  { id: 'grid', label: 'Grid' },
  { id: 'table', label: 'Table' },
];

export const tableColumnKeys = [
  { id: 'number', label: 'Number' },
  { id: 'area', label: 'Area' },
  { id: 'capacity', label: 'Capacity' },
  { id: 'status', label: 'Status' },
] as const;

export const historyActionLabels: Record<HistoryActionId, string> = {
  update: 'Update',
  create: 'Create',
  settings: 'Settings',
  delete: 'Delete',
};

export const historyActionFilterOptions: ReadonlyArray<{
  id: HistoryActionFilter;
  label: string;
}> = [
  { id: 'all', label: 'All actions' },
  { id: 'update', label: 'Update' },
  { id: 'create', label: 'Create' },
  { id: 'settings', label: 'Settings' },
  { id: 'delete', label: 'Delete' },
];

export const historySubTabs: ReadonlyArray<{
  id: HistorySubTabId;
  label: string;
}> = [
  { id: 'general', label: 'General History' },
  { id: 'table-status', label: 'Table Status' },
];

export const generalHistoryColumns = [
  { id: 'occurredAt', label: 'Date & Time' },
  { id: 'action', label: 'Action' },
  { id: 'changedBy', label: 'Changed By' },
  { id: 'previousValue', label: 'Previous' },
  { id: 'newValue', label: 'New Value' },
] as const;

export const tableStatusHistoryColumns = [
  { id: 'occurredAt', label: 'Date & Time' },
  { id: 'tableNumber', label: 'Table' },
  { id: 'guestName', label: 'Guest' },
  { id: 'partySize', label: 'Party Size' },
  { id: 'source', label: 'Source' },
] as const;

export const historyPageSize = 5;
