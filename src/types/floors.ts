export type ApiFloorStatus = 'active' | 'inactive' | 'archived' | 'draft' | (string & {});
export type ApiFloorType = 'indoor' | 'outdoor' | 'vip' | 'banquet' | (string & {});

export type ApiFloor = Readonly<{
  id: number | string;
  public_id?: string | null;
  organization_id?: number | null;
  company_id?: number | null;
  branch_id?: number | null;
  name: string;
  description?: string | null;
  sort_order?: number | null;
  status?: ApiFloorStatus | null;
  version?: number | null;
  archived_at?: string | null;
  archived_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  code?: string | null;
  floor_type?: ApiFloorType | null;
  type?: ApiFloorType | null;
  is_active?: boolean | null;
  table_count?: number | null;
  seat_count?: number | null;
  created_by?: string | { first_name?: string | null; last_name?: string | null } | null;
  branch_name?: string | null;
  sections?: readonly ApiFloorSection[] | null;
}>;

export type ApiFloorSection = Readonly<{
  id?: number | string;
  name: string;
  code?: string | null;
  description?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  version?: number | null;
  table_count?: number | null;
  seat_count?: number | null;
  section_id?: number | string | null;
}>;

export type CreateFloorInput = Readonly<{
  name: string;
  code?: string | null;
  description?: string | null;
  floor_type?: ApiFloorType | null;
  is_active?: boolean;
  sort_order?: number | null;
}>;
export type UpdateFloorInput = CreateFloorInput & Readonly<{ version?: number }>;
export type ArchiveEntityInput = Readonly<{ version: number; reason?: string | null }>;
export type ReorderFloorsInput = Readonly<{
  items: readonly Readonly<{ floor_id: number | string; sort_order: number; version: number }>[];
}>;
export type FloorsListResponse = Readonly<{ items: readonly ApiFloor[]; total: number }>;
export type FloorsListApiPayload = Readonly<{
  floors?: readonly ApiFloor[];
  items?: readonly ApiFloor[];
  total?: number;
}>;

export type CreateSectionInput = Readonly<{
  name: string;
  code?: string | null;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number | null;
}>;
export type UpdateSectionInput = CreateSectionInput &
  Readonly<{ version?: number; status?: string | null }>;
export type SectionsListResponse = Readonly<{ items: readonly ApiFloorSection[]; total: number }>;
export type SectionsListApiPayload = Readonly<{
  sections?: readonly ApiFloorSection[];
  items?: readonly ApiFloorSection[];
  total?: number;
}>;

export type ApiDiningTable = Readonly<{
  id: number | string;
  section_id?: number | string | null;
  table_number?: string | null;
  number?: string | null;
  code?: string | null;
  capacity?: number | null;
  seats?: number | null;
  shape?: string | null;
  status?: string | null;
  is_active?: boolean | null;
  reservations_enabled?: boolean | null;
  version?: number | null;
}>;
export type CreateTableInput = Readonly<{
  table_number?: string;
  name?: string;
  capacity?: number;
  reservations_enabled?: boolean;
  is_active?: boolean;
  description?: string | null;
  sort_order?: number | null;
}>;
export type BulkCreateTablesInput = Readonly<{
  tables?: readonly CreateTableInput[];
  items?: readonly CreateTableInput[];
}>;
export type BulkUpdateTablesInput = Readonly<{
  tables?: readonly Readonly<{ id: number | string; version?: number } & UpdateTableInput>[];
  items?: readonly Readonly<{ table_id: number | string; version: number } & UpdateTableInput>[];
}>;
export type UpdateTableInput = Readonly<{
  table_number?: string;
  name?: string | null;
  capacity?: number | null;
  shape?: string | null;
  status?: string | null;
  is_active?: boolean;
  reservations_enabled?: boolean;
  version?: number;
  sort_order?: number | null;
}>;
export type MoveTableInput = Readonly<{ target_section_id: number | string }>;
export type ReorderTablesInput = Readonly<{ items: readonly unknown[] }>;
export type TablesListResponse = Readonly<{ items: readonly ApiDiningTable[]; total: number }>;
export type TablesListApiPayload = Readonly<{
  tables?: readonly ApiDiningTable[];
  items?: readonly ApiDiningTable[];
  total?: number;
}>;
export type ApiFloorMap = Readonly<{
  tables?: readonly ApiDiningTable[];
  items?: readonly ApiDiningTable[];
  floors?: readonly unknown[];
}>;
export type CombineTablesInput = Readonly<{
  table_ids: readonly (number | string)[];
  name?: string | null;
}>;
export type ApiTableCombination = Readonly<{ id: number | string }>;
export type CombinationsListResponse = Readonly<{
  items: readonly ApiTableCombination[];
  total: number;
}>;
export type CombinationsListApiPayload = Readonly<{
  combinations?: readonly ApiTableCombination[];
  items?: readonly ApiTableCombination[];
  total?: number;
}>;
export type ApiTableQr = Readonly<{
  table_id?: number | string;
  qr_url?: string | null;
  qr_token?: string | null;
}>;
