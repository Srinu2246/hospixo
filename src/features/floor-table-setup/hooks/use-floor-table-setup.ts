'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createFloorRequest,
  createTableRequest,
  deleteFloorRequest,
  deleteTableRequest,
  fetchFloors,
  fetchTables,
  updateFloorRequest,
  updateTableRequest,
} from '@/features/floor-table-setup/api/floors';
import type {
  CreateFloorInput,
  CreateTableInput,
  UpdateFloorInput,
  UpdateTableInput,
} from '@/features/floor-table-setup/types/floor-table';

export const floorsQueryKey = (branchId?: number | null) =>
  ['floors', branchId ?? 'session'] as const;

export const floorTablesQueryKey = (floorId: number, branchId?: number | null) =>
  ['floors', branchId ?? 'session', floorId, 'tables'] as const;

export function useFloors(branchId?: number | null) {
  return useQuery({
    queryKey: floorsQueryKey(branchId),
    queryFn: () => fetchFloors(branchId ? { branch_id: branchId } : undefined),
  });
}

export function useFloorTables(floorId: number | null, branchId?: number | null) {
  return useQuery({
    queryKey: floorTablesQueryKey(floorId ?? 0, branchId),
    queryFn: () => fetchTables(floorId!, branchId ? { branch_id: branchId } : undefined),
    enabled: floorId != null && floorId > 0,
  });
}

export function useFloorTableMutations(branchId?: number | null) {
  const queryClient = useQueryClient();
  const branchQuery = branchId ? { branch_id: branchId } : {};

  const invalidateFloors = async () => {
    await queryClient.invalidateQueries({ queryKey: floorsQueryKey(branchId) });
  };

  const invalidateTables = async (floorId: number) => {
    await queryClient.invalidateQueries({
      queryKey: floorTablesQueryKey(floorId, branchId),
    });
    await invalidateFloors();
  };

  const createFloor = useMutation({
    mutationFn: (body: CreateFloorInput) => createFloorRequest({ ...body, ...branchQuery }),
    onSuccess: invalidateFloors,
  });

  const updateFloor = useMutation({
    mutationFn: ({ floorId, body }: { floorId: number; body: UpdateFloorInput }) =>
      updateFloorRequest(floorId, { ...body, ...branchQuery }),
    onSuccess: invalidateFloors,
  });

  const deleteFloor = useMutation({
    mutationFn: (floorId: number) => deleteFloorRequest(floorId, branchQuery),
    onSuccess: invalidateFloors,
  });

  const createTable = useMutation({
    mutationFn: ({ floorId, body }: { floorId: number; body: CreateTableInput }) =>
      createTableRequest(floorId, { ...body, ...branchQuery }),
    onSuccess: (_data, variables) => invalidateTables(variables.floorId),
  });

  const updateTable = useMutation({
    mutationFn: ({
      floorId,
      tableId,
      body,
    }: {
      floorId: number;
      tableId: number;
      body: UpdateTableInput;
    }) => updateTableRequest(floorId, tableId, { ...body, ...branchQuery }),
    onSuccess: (_data, variables) => invalidateTables(variables.floorId),
  });

  const deleteTable = useMutation({
    mutationFn: ({ floorId, tableId }: { floorId: number; tableId: number }) =>
      deleteTableRequest(floorId, tableId, branchQuery),
    onSuccess: (_data, variables) => invalidateTables(variables.floorId),
  });

  return {
    createFloor,
    updateFloor,
    deleteFloor,
    createTable,
    updateTable,
    deleteTable,
  };
}
