export type FloorStatus = 'active' | 'inactive' | 'draft';

export type FloorType = 'indoor' | 'outdoor' | 'vip' | 'banquet';

export type FloorSortId = 'recent' | 'name' | 'tables';

export type FloorStatusFilter = 'all' | FloorStatus;

export type FloorDetailTabId = 'overview' | 'floor' | 'sections' | 'tables' | 'history';

export type WizardStepId = 'floor' | 'section' | 'table' | 'review';

export type FloorTableStatus = 'available' | 'reserved' | 'occupied';

export type SectionStatus = 'active' | 'inactive';

export type SectionStatusFilter = 'all' | SectionStatus;

export type TableConfigStatus = 'active' | 'inactive';

export type TableConfigStatusFilter = 'all' | TableConfigStatus;

export type TableShape = 'round' | 'square' | 'rectangle';

export type TableViewId = 'grid' | 'table';

export type HistoryActionId = 'update' | 'create' | 'settings' | 'delete';

export type HistoryActionFilter = 'all' | HistoryActionId;

export type HistorySubTabId = 'general' | 'table-status';

export type SetupStatus = FloorStatus | SectionStatus | TableConfigStatus;

export type FloorSection = Readonly<{
  id: string;
  name: string;
  code?: string;
  description?: string;
  status: SectionStatus;
  version?: number;
  tableCount: number;
  seatCount: number;
  isDefault?: boolean;
}>;

export type FloorTableItem = Readonly<{
  id: string;
  number: string;
  capacity: number;
  status: FloorTableStatus;
  configStatus: TableConfigStatus;
  version?: number;
  reservations: boolean;
  area: string;
  shape: TableShape;
  sectionId?: string;
  combinationId?: string;
  isCombined?: boolean;
}>;

export type FloorStats = Readonly<{
  totalTables: number;
  totalSeats: number;
  activeTables: number;
  inactiveTables: number;
}>;

export type FloorActivity = Readonly<{
  id: string;
  message: string;
  occurredAt: string;
}>;

export type FloorHistoryEntry = Readonly<{
  id: string;
  occurredAt: string;
  action: HistoryActionId;
  changedBy: string;
  previousValue: string;
  newValue: string;
}>;

export type TableStatusHistoryEntry = Readonly<{
  id: string;
  occurredAt: string;
  tableNumber: string;
  guestName: string;
  partySize: number;
  source: string;
}>;

export type FloorHistoryStats = Readonly<{
  reserved: number;
  occupied: number;
  notReserved: number;
}>;

export type FloorHistoryLog = Readonly<{
  stats: FloorHistoryStats;
  general: readonly FloorHistoryEntry[];
  tableStatus: readonly TableStatusHistoryEntry[];
}>;

export type Floor = Readonly<{
  id: string;
  name: string;
  code?: string;
  type: FloorType | null;
  version?: number;
  status: FloorStatus;
  tableCount: number;
  seatCount: number;
  updatedAt: string;
  branch: string;
  createdOn: string;
  createdBy: string;
  description: string;
  sections: readonly FloorSection[];
  tables?: readonly FloorTableItem[];
  stats: FloorStats;
  activity: readonly FloorActivity[];
}>;

export type FloorDraftForm = Readonly<{
  name: string;
  code: string;
  type: FloorType | '';
  description: string;
  active: boolean;
}>;

export type SectionDraft = Readonly<{
  id: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
  tableCount: number;
  seatCount: number;
  version?: number;
  isDefault?: boolean;
}>;

export type TableDraft = Readonly<{
  id: string;
  number: string;
  capacity: number;
  status: FloorTableStatus;
  reservations: boolean;
  sectionId?: string;
  version?: number;
}>;

export type FloorSetupDraft = Readonly<{
  floor: FloorDraftForm;
  sections: readonly SectionDraft[];
  tables: readonly TableDraft[];
}>;

export type FloorDraft = Readonly<{
  name: string;
  type: FloorType;
}>;
