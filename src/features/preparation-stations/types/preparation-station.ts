import type { PreparationStationStatus } from './preparation-station-api';

export type PreparationStation = {
  id: string;
  name: string;
  code: string;
  status?: PreparationStationStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CreatePreparationStationInput = {
  name: string;
  code: string;
};

export type UpdatePreparationStationInput = {
  name?: string;
  code?: string;
  status?: PreparationStationStatus;
};

export type PreparationStationsViewMode =
  'list' | 'create-station' | 'view-station' | 'edit-station';
