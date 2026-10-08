export const branchTablesCopy = {
  title: 'Tables',
  subtitle: 'Floor map and seating — select a table to start dine-in service.',
  floorLabel: 'Floor',
  floorPlaceholder: 'Select floor',
  allFloors: 'All floors',
  emptyFloors: 'No floors configured yet. Set up floors and tables first.',
  emptyTables: 'No tables on this floor.',
  setupLink: 'Floor & Table Set-up',
  loadError: 'Unable to load branch tables.',
  branchRequired: 'Sign in with a branch account to view the floor map.',
  stats: {
    total: 'Total tables',
    vacant: 'Vacant',
    occupied: 'Occupied',
    billing: 'Billing',
  },
  tableCard: {
    seats: 'seats',
    openDineIn: 'Open dine-in',
    statusHelp: 'Live table status updates when order APIs are connected.',
  },
} as const;

export const tableStatusTooltips: Record<
  'vacant' | 'occupied' | 'billing' | 'reserved' | 'inactive',
  string
> = {
  vacant: 'Available for seating and new orders.',
  occupied: 'Guests seated — order in progress.',
  billing: 'Bill requested or payment in progress.',
  reserved: 'Held for a reservation.',
  inactive: 'Table disabled in floor setup.',
};
