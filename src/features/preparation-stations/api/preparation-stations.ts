import { clientApi } from '@/lib/client-api';
import type {
  CreatePreparationStationInput,
  PreparationStation,
  UpdatePreparationStationInput,
} from '../types/preparation-station';
import type {
  CreatePreparationStationApiRequest,
  ListPreparationStationsApiQuery,
  PreparationStationApi,
  PreparationStationId,
  UpdatePreparationStationApiRequest,
} from '../types/preparation-station-api';

export function mapPreparationStationApi(station: PreparationStationApi): PreparationStation {
  return {
    id: String(station.id),
    name: station.name,
    code: station.code,
    status: station.status,
    createdAt: station.created_at,
    updatedAt: station.updated_at,
  };
}

export function mapPreparationStationsApi(
  stations: readonly PreparationStationApi[],
): PreparationStation[] {
  return stations.map(mapPreparationStationApi);
}

export function unwrapPreparationStationList(data: unknown): PreparationStationApi[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as PreparationStationApi[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['items', 'data', 'stations']) {
      if (Array.isArray(obj[key])) return obj[key] as PreparationStationApi[];
    }
  }
  return [];
}

export function toCreatePreparationStationPayload(
  input: CreatePreparationStationInput,
): CreatePreparationStationApiRequest {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
  };
}

export function toUpdatePreparationStationPayload(
  input: UpdatePreparationStationInput,
): UpdatePreparationStationApiRequest {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.code !== undefined) payload.code = input.code.trim().toUpperCase();
  if (input.status !== undefined) payload.status = input.status;
  return payload as UpdatePreparationStationApiRequest;
}

export async function fetchPreparationStationsClient(
  query?: ListPreparationStationsApiQuery,
): Promise<PreparationStation[]> {
  const params = new URLSearchParams();
  if (query?.status) params.set('status', query.status);
  const qs = params.toString();
  const queryString = qs ? `?${qs}` : '';
  const res = await clientApi.get<{ success?: boolean; data?: unknown }>(
    `/menu/preparation-stations${queryString}`,
  );
  const list = unwrapPreparationStationList(res?.data ?? res);
  return mapPreparationStationsApi(list);
}

export async function fetchPreparationStationByIdClient(
  stationId: PreparationStationId,
): Promise<PreparationStation | null> {
  const res = await clientApi.get<{ success?: boolean; data?: PreparationStationApi }>(
    `/menu/preparation-stations/${encodeURIComponent(stationId)}`,
  );
  if (!res?.data) return null;
  return mapPreparationStationApi(res.data);
}

export async function createPreparationStationClient(
  input: CreatePreparationStationInput,
): Promise<PreparationStation> {
  const body = toCreatePreparationStationPayload(input);
  const res = await clientApi.post<{ success?: boolean; data?: PreparationStationApi }>(
    '/menu/preparation-stations',
    body,
  );
  if (!res?.data) throw new Error('Failed to create preparation station');
  return mapPreparationStationApi(res.data);
}

export async function updatePreparationStationClient(
  stationId: PreparationStationId,
  input: UpdatePreparationStationInput,
): Promise<PreparationStation> {
  const body = toUpdatePreparationStationPayload(input);
  const res = await clientApi.patch<{ success?: boolean; data?: PreparationStationApi }>(
    `/menu/preparation-stations/${encodeURIComponent(stationId)}`,
    body,
  );
  if (!res?.data) throw new Error('Failed to update preparation station');
  return mapPreparationStationApi(res.data);
}
