export type FloorStatus = 'active' | 'inactive';
export type TableStatus = 'active' | 'inactive';
export type TableShape = 'square' | 'round' | 'rectangle';

export type FloorDto = Readonly<{
  id: number;
  branch_id: number;
  name: string;
  sort_order?: number | null;
  status: FloorStatus;
  table_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}>;

export type TableDto = Readonly<{
  id: number;
  floor_id: number;
  branch_id?: number | null;
  name: string;
  seats: number;
  shape?: TableShape | null;
  sort_order?: number | null;
  status: TableStatus;
  created_at?: string | null;
  updated_at?: string | null;
}>;

export type FloorsListResponse = Readonly<{
  items: readonly FloorDto[];
  total: number;
}>;

export type TablesListResponse = Readonly<{
  items: readonly TableDto[];
  total: number;
}>;

export type CreateFloorInput = Readonly<{
  name: string;
  sort_order?: number;
  status?: FloorStatus;
}>;

export type UpdateFloorInput = Readonly<{
  name?: string;
  sort_order?: number;
  status?: FloorStatus;
}>;

export type CreateTableInput = Readonly<{
  name: string;
  seats: number;
  shape?: TableShape;
  sort_order?: number;
  status?: TableStatus;
}>;

export type UpdateTableInput = Readonly<{
  name?: string;
  seats?: number;
  shape?: TableShape;
  sort_order?: number;
  status?: TableStatus;
}>;

export type FloorWithTables = Readonly<{
  floor: FloorDto;
  tables: readonly TableDto[];
}>;
