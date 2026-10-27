export type WizardStep = 'floor' | 'section' | 'table' | 'review';

export type FloorSort = 'recent' | 'name' | 'tables';

export type FloorDetails = {
  name: string;
  code: string;
  description: string;
  active: boolean;
};

export type SectionDraft = {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
};

export type TableDraft = {
  id: string;
  number: string;
  seats: number;
  active: boolean;
  reservations: boolean;
  sectionId: string | null;
};

export type SavedFloor = {
  id: string;
  details: FloorDetails;
  sections: SectionDraft[];
  tables: TableDraft[];
  updatedAt: number;
};

export type SectionInput = {
  name: string;
  code: string;
  description: string;
  active: boolean;
};

export type TableGenerateInput = {
  start: string;
  count: number;
  seats: number;
  reservations: boolean;
};

export type TableBulkEditInput = {
  start: string;
  end: string;
  seats: number;
  active: boolean;
  reservations: boolean;
};

export type FloorDetailTab = 'overview' | 'floor' | 'sections' | 'tables';

/** Shared active/inactive list filter (floors, sections, tables). */
export const ActiveStatusFilter = {
  All: 'all',
  Active: 'active',
  Inactive: 'inactive',
} as const;

export type ActiveStatusFilter = (typeof ActiveStatusFilter)[keyof typeof ActiveStatusFilter];

export const ACTIVE_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  id: ActiveStatusFilter;
  label: string;
}> = [
  { id: ActiveStatusFilter.All, label: 'All' },
  { id: ActiveStatusFilter.Active, label: 'Active' },
  { id: ActiveStatusFilter.Inactive, label: 'Inactive' },
];

export type FloorStatusFilter = ActiveStatusFilter;

export type FloorSummary = {
  id: string;
  name: string;
  code: string;
  active: boolean;
  tableCount: number | null;
  seatCount: number | null;
  updatedAt: number;
  updatedLabel: string;
};

export type CatalogSection = {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
  tableCount: number;
  seatCount: number;
  activeTableCount: number;
  inactiveTableCount: number;
  version?: number;
  sortOrder?: number;
};

export type CatalogTable = {
  id: string;
  number: string;
  seats: number;
  active: boolean;
  reservations: boolean;
  sectionId: string;
  area: string;
  shape: string;
  description?: string;
  version?: number;
  sortOrder?: number;
};

export type CatalogFloor = {
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
  branch: string;
  createdBy: string;
  createdOn: string;
  updatedLabel: string;
  updatedAt: number;
  tableCount: number;
  seatCount: number;
  hubTableCount: number;
  hubSeatCount: number;
  activeTableCount: number;
  maintenanceCount: number;
  sections: CatalogSection[];
  tables: CatalogTable[];
};
