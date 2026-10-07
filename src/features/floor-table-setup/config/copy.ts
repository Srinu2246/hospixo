export const floorTableSetupCopy = {
  listTitle: 'Floor & Table Set-up',
  listSubtitle: 'Configure dining floors and table layout for POS and captain workflows.',
  createTitle: 'Create floor',
  createSubtitle: 'Add a new floor, then assign tables for dine-in service.',
  emptyFloors: 'No floors yet. Create your first floor to start adding tables.',
  emptyTables: 'No tables on this floor yet.',
  addFloor: 'Add floor',
  addTable: 'Add table',
  editFloor: 'Edit floor',
  editTable: 'Edit table',
  deleteFloor: 'Delete floor',
  deleteTable: 'Delete table',
  deleteFloorConfirm: 'Delete this floor and all of its tables? This cannot be undone.',
  deleteTableConfirm: 'Remove this table from the floor?',
  branchRequired: 'Sign in with a branch account to manage floors and tables.',
  loadError: 'Unable to load floors and tables.',
  floorNameHint: 'Shown on POS floor map and captain table list.',
  tableSeatsHint: 'Maximum guests this table can seat.',
  tableShapeHint: 'Used for floor map layout preview.',
} as const;

export const tableShapeOptions = [
  { value: 'square', label: 'Square' },
  { value: 'round', label: 'Round' },
  { value: 'rectangle', label: 'Rectangle' },
] as const;

export const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
] as const;
