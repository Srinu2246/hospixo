import type {
  FloorDetailTabId,
  FloorSortId,
  FloorStatus,
  FloorStatusFilter,
  FloorType,
  SetupStatus,
} from '@/features/floor-table-setup/types/floor-table-setup';

export const floorTableSetupCopy = {
  listTitle: 'Floor Management',
  listSubtitle: 'Hospixo Floor & Seating Management',
  searchPlaceholder: 'Search floors...',
  sortLabel: 'Sort by:',
  statusLabel: 'Status',
  createFloor: 'Create Floor',
  emptyHubTitle: 'No Floors Added Yet',
  emptyHubDescription:
    'Create floors to organize your service areas, manage dining tables, and streamline order workflows for your staff.',
  createTable: 'Add Table',
  viewFloor: 'View floor',
  editFloor: 'Edit floor',
  backToFloors: 'Back to floors',
  emptyFloors: 'No floors match the current search or filters.',
  emptyDescription: 'Try a different search, or create a new floor.',
  loadErrorTitle: 'Something Went Wrong',
  loadErrorDescription:
    "We couldn't load your floor management data. Please verify your connection and try again.",
  retry: 'Retry Connection',
  goBack: 'Go Back',
  deselectAll: 'Deselect All',
  changePassword: 'Change password',
  creatingFloor: 'Saving…',
  saving: 'Saving…',
  creatingSection: 'Creating…',
  applyingChanges: 'Applying…',
  selectBranch: 'Select a branch',
  viewAll: 'View All',
  statsSeparator: ' · ',
  tablesSuffix: 'Tables',
  seatsSuffix: 'Seats',
  updatedPrefix: 'Updated',
  floorInformation: 'Floor Information',
  sectionsOverview: 'Sections Overview',
  noUserSectionsHint:
    'No dining sections yet. Open the Sections tab to create zones for this floor.',
  recentActivity: 'Recent Activity',
  descriptionLabel: 'Floor Description',
  descriptionPlaceholder: 'Enter floor description',
  floorTypeNotSet: 'Not set',
  addFloorTitle: 'Create Floor',
  addFloorName: 'Floor name',
  addFloorType: 'Floor type',
  addFloorTypePlaceholder: 'Select floor type',
  addFloorSubmit: 'Create floor',
  addFloorCancel: 'Cancel',
  addTableTitle: 'Add Table',
  addTableName: 'Table name',
  addTableSeats: 'Seats',
  addTableSubmit: 'Add table',
  addTableCancel: 'Cancel',
  addTableEmpty: 'No tables have been added to this floor yet.',
  labels: {
    floorName: 'Floor Name',
    floorType: 'Floor Type',
    createdOn: 'Created On',
    branch: 'Branch',
    tables: 'Tables',
    status: 'Status',
    createdBy: 'Created By',
  },
  stats: {
    totalTables: 'Total Tables',
    totalSeats: 'Total Seats',
    activeTables: 'Active Tables',
    maintenance: 'Maintenance',
  },
} as const;

export const floorTypeLabels: Record<FloorType, string> = {
  indoor: 'INDOOR',
  outdoor: 'OUTDOOR',
  vip: 'VIP',
  banquet: 'BANQUET',
};

export const floorTypeSelectLabels: Record<FloorType, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  vip: 'VIP',
  banquet: 'Banquet',
};

export const floorStatusLabels: Record<FloorStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
};

export const setupStatusLabels: Record<SetupStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  archived: 'Archived',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
};

export const floorSortOptions: ReadonlyArray<{
  id: FloorSortId;
  label: string;
}> = [
  { id: 'recent', label: 'Recently Updated' },
  { id: 'name', label: 'Name' },
  { id: 'tables', label: 'Table count' },
];

export const floorStatusFilterOptions: ReadonlyArray<{
  id: FloorStatusFilter;
  label: string;
}> = [
  { id: 'all', label: 'Status' },
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' },
];

export const floorDetailTabs: ReadonlyArray<{
  id: FloorDetailTabId;
  label: string;
}> = [
  { id: 'overview', label: 'Overview' },
  { id: 'floor', label: 'Floor' },
  { id: 'sections', label: 'Sections' },
  { id: 'tables', label: 'Tables' },
  { id: 'history', label: 'History' },
];

export const floorDetailEmptyCopy: Record<
  Exclude<FloorDetailTabId, 'overview'>,
  { title: string; description: string }
> = {
  floor: {
    title: 'Floor layout',
    description: 'Visual floor layout editing will appear here.',
  },
  sections: {
    title: 'Sections',
    description: 'Section management for this floor will appear here.',
  },
  tables: {
    title: 'Tables',
    description: 'Add and arrange tables for this floor.',
  },
  history: {
    title: 'History',
    description: 'A full activity history for this floor will appear here.',
  },
};

export const floorTypeOptions = Object.entries(floorTypeSelectLabels).map(([id, label]) => ({
  id: id as FloorType,
  label,
}));
