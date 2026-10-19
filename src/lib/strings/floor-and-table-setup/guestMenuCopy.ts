export const guestMenuCopy = {
  loading: 'Loading menu…',
  errorTitle: 'Menu unavailable',
  missingParams:
    'This link is missing branch, floor, section, or menu details. Scan a QR code from floor setup again.',
  missingBranchMenu:
    'No active dine-in menu is assigned to this branch. Assign a menu in branch settings, then regenerate the QR code.',
  emptyCategories: 'No menu categories are available for this section yet.',
  locationLabel: (branch: string, floor: string, section: string) =>
    `${branch} · ${floor} · ${section}`,
} as const;
