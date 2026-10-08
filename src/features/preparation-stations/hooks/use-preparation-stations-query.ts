'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPreparationStationClient,
  fetchPreparationStationByIdClient,
  fetchPreparationStationsClient,
  updatePreparationStationClient,
} from '../api/preparation-stations';
import type {
  CreatePreparationStationInput,
  UpdatePreparationStationInput,
} from '../types/preparation-station';
import type {
  ListPreparationStationsApiQuery,
  PreparationStationId,
} from '../types/preparation-station-api';

export const preparationStationsQueryKey = (query?: ListPreparationStationsApiQuery) =>
  ['preparation-stations', 'list', query ?? {}] as const;

export function usePreparationStationsListQuery(query?: ListPreparationStationsApiQuery) {
  return useQuery({
    queryKey: preparationStationsQueryKey(query),
    queryFn: () => fetchPreparationStationsClient(query),
  });
}

export function useCreatePreparationStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePreparationStationInput) => createPreparationStationClient(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['preparation-stations'] });
    },
  });
}

export function useUpdatePreparationStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      stationId,
      input,
    }: {
      stationId: PreparationStationId;
      input: UpdatePreparationStationInput;
    }) => updatePreparationStationClient(stationId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['preparation-stations'] });
    },
  });
}

export async function fetchPreparationStationDetail(stationId: PreparationStationId) {
  return fetchPreparationStationByIdClient(stationId);
}
