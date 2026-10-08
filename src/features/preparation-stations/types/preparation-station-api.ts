export type PreparationStationId = string; // NOSONAR

export type PreparationStationStatus = 'active' | 'inactive';

export type PreparationStationApi = Readonly<{
  id: number;
  organization_id?: number;
  company_id?: number;
  name: string;
  code: string;
  status?: PreparationStationStatus | string;
  created_at?: string;
  updated_at?: string;
}>;

export type CreatePreparationStationApiRequest = Readonly<{
  name: string;
  code: string;
}>;

export type UpdatePreparationStationApiRequest = Readonly<{
  name?: string;
  code?: string;
  status?: PreparationStationStatus;
}>;

export type ListPreparationStationsApiQuery = Readonly<{
  status?: PreparationStationStatus;
}>;
