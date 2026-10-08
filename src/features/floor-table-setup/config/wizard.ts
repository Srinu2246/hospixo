import type {
  FloorTableStatus,
  FloorType,
  WizardStepId,
} from '@/features/floor-table-setup/types/floor-table-setup';

export const wizardSteps: ReadonlyArray<{ id: WizardStepId; label: string }> = [
  { id: 'floor', label: 'Floor Creation' },
  { id: 'section', label: 'Section Creation' },
  { id: 'table', label: 'Table Creation' },
  { id: 'review', label: 'Review' },
];

export const wizardCopy = {
  floorTitle: 'Floor Creation',
  branch: 'Branch',
  branchPlaceholder: 'Select a branch',
  branchHint: 'Floors and tables are saved to this branch.',
  branchRequired: 'Select a branch to continue.',
  floorName: 'Floor Name',
  floorCode: 'Floor Code',
  floorCodeHint: 'Assigned code for orders routing',
  floorType: 'Floor Type',
  floorTypePlaceholder: 'Select floor type',
  description: 'Description',
  descriptionPlaceholder: 'Enter floor description',
  floorStatus: 'Floor Status',
  floorStatusHint: 'Toggle active visibility on checkout POS channels',
  sectionsTitle: 'Sections List',
  sectionsSubtitle: 'Manage and organize dining zones within this floor',
  addSection: 'Add Section',
  createSection: 'Create Section',
  createSectionTitle: 'Create New Section',
  sectionName: 'Section Name',
  sectionNamePlaceholder: 'e.g. Main Dining',
  sectionCode: 'Section Code',
  sectionCodePlaceholder: 'e.g. MD-001',
  sectionCodeRequired: 'Section code is required.',
  sectionCodeHint: 'Auto-generated code for POS routing',
  sectionDescriptionPlaceholder: 'Describe this dining section zone...',
  sectionStatus: 'Section Status',
  sectionStatusHint: 'Toggle active visibility on checkout POS channels',
  searchSections: 'Search sections...',
  emptySectionsTitle: 'No Sections Created Yet',
  emptySectionsDescription:
    'Organize your floor by creating sections to group tables, assign servers, and manage dining areas efficiently.',
  tablesTitle: 'Tables List',
  tablesSubtitle: 'Manage and view configuration of layout tables',
  addTable: 'Add Table',
  addFirstTable: 'Add Your First Table',
  searchTables: 'Search tables...',
  bulkEdit: 'Bulk Edit',
  bulkGenerate: 'Bulk Generate',
  emptyTablesTitle: 'No Tables Yet',
  emptyTablesDescription:
    'Get started by adding your first table to manage seating, layouts, and guest orders efficiently.',
  createTableTitle: 'Create Table',
  addNewSection: 'Add new section',
  newSectionName: 'New section name',
  sectionRequired: 'Add a section to create tables.',
  startNumber: 'Starting Table Number',
  numberOfTables: 'Number of Tables',
  preview: 'Preview',
  capacity: 'Capacity',
  reservations: 'Reservations',
  reservationsHint: 'Set permissions for accepting and managing reservations',
  generate: 'Generate',
  bulkTitle: 'Bulk Generate Tables',
  bulkSubtitle: 'Generate multiple sequential tables at once',
  count: 'Number of Tables',
  reviewTitle: 'Review Floor Details',
  reviewSubtitle: 'Please review all settings before creating the floor.',
  floorDetails: 'Floor Details',
  sectionsReview: 'Sections Review',
  tablesSetup: 'Tables Setup',
  tablesConfigured: 'Tables Configured',
  edit: 'Edit',
  back: 'Back',
  cancel: 'Cancel',
  createFloor: 'Create Floor',
  setupPermissions: 'Setup Permissions',
  successTitle: 'Floor Created Successfully!',
  seatingSummary: 'Seating Summary',
  reservationsOnline: 'Online Active',
  reservationsOffline: 'Offline',
  tablesUnit: 'Tables',
  seatsUnit: 'Seats',
  successDescription: (floorName: string, outlet: string) =>
    `The ${floorName} has been configured and is now active for ${outlet}.`,
  successHub: 'Back to Setup Hub',
  successSetup: 'Go to Floor Set-up',
  columnSectionName: 'Section Name',
  columnSectionCode: 'Section Code',
  columnTables: 'Tables',
  columnSeats: 'Seats',
  columnStatus: 'Status',
  columnTableNumber: 'Table Number',
  columnCapacity: 'Capacity',
  columnActions: 'Actions',
} as const;

export const wizardFooterNext: Record<WizardStepId, string> = {
  floor: wizardCopy.createFloor,
  section: 'Table Creation',
  table: wizardCopy.setupPermissions,
  review: wizardCopy.createFloor,
};

export const wizardEmpty = {
  hub: {
    title: wizardCopy.emptySectionsTitle,
    description: wizardCopy.emptySectionsDescription,
  },
} as const;

export const sectionCodePrefix = 'SEC';

export const floorFormDefaults = {
  name: '',
  code: '',
  type: '' as FloorType | '',
  description: '',
  active: true,
};

export const floorTypeFormLabels: Record<FloorType, string> = {
  indoor: 'Indoor Dining',
  outdoor: 'Outdoor',
  vip: 'VIP',
  banquet: 'Banquet',
};

export const floorTypeFormOptions = Object.entries(floorTypeFormLabels).map(([id, label]) => ({
  id: id as FloorType,
  label,
}));

export const tableCapacityOptions = [2, 4, 6, 8, 10] as const;

export const tableStatusLabels: Record<FloorTableStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  occupied: 'Occupied',
};

export const bulkGenerateDefaults = {
  startNumber: 'T001',
  count: 25,
  capacity: 4,
  reservations: true,
} as const;

export const createTableDefaults = {
  startNumber: 'T001',
  count: 1,
  capacity: 4,
  reservations: true,
} as const;

export const wizardOutletName = 'Hotel Mayukha Jungle Theme';

export const successSummaryRows = [
  { id: 'name', label: wizardCopy.floorName },
  { id: 'seating', label: wizardCopy.seatingSummary },
  { id: 'reservations', label: wizardCopy.reservations },
] as const;

export const reviewColumns = [
  { id: 'name', label: wizardCopy.columnSectionName },
  { id: 'code', label: wizardCopy.columnSectionCode },
  { id: 'tables', label: wizardCopy.columnTables },
  { id: 'seats', label: wizardCopy.columnSeats },
  { id: 'status', label: wizardCopy.columnStatus },
] as const;
