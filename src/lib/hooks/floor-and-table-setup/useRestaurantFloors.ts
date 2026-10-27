'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';

import type { FloorStatusFilter } from '@/features/management/floor-and-table-setup/types/floorSetup';
import {
  parseFloorRecord,
  parseFloorList,
  parseSectionList,
  parseSectionRecord,
  parseFloorMapTables,
  parseTableBulk,
  parseTableList,
  parseTableListPage,
  parseTableRecord,
  toCatalogSection,
  toCatalogTable,
  toFloorSummary,
  type FloorListItem,
  type ArchiveBody,
  type BulkCreateTablesBody,
  type BulkUpdateTablesBody,
  type CreateFloorBody,
  type CreateSectionBody,
  type CreateTableBody,
  type MoveTableBody,
  type UpdateFloorBody,
  type UpdateSectionBody,
  type UpdateTableBody,
} from '@/lib/schemas/floor-and-table-setup/floors';
import { api } from '@/services/api/browserClient';
import { ApiError } from '@/services/api/types';
import {
  restaurantFloorArchivePath,
  restaurantFloorPath,
  restaurantFloorRestorePath,
  restaurantFloorSectionArchivePath,
  restaurantFloorSectionPath,
  restaurantFloorSectionRestorePath,
  restaurantFloorSectionsPath,
  restaurantFloorsPath,
  restaurantSectionFloorMapPath,
  restaurantSectionTableArchivePath,
  restaurantSectionTableMovePath,
  restaurantSectionTablePath,
  restaurantSectionTableRestorePath,
  restaurantSectionTablesBulkPath,
  restaurantSectionTablesPath,
} from '@/services/api/ApiUrlsV1';

const floorsKey = (branchId: number | undefined) => ['restaurant', 'floors', branchId] as const;

function listParams(status: FloorStatusFilter | undefined) {
  return {
    page: 1,
    page_size: 50,
    ...(status && status !== 'all' ? { status } : {}),
  };
}

function requireBranch(branchId: number | undefined): number {
  if (typeof branchId !== 'number') {
    throw new ApiError('Select a branch before changing floors.', 400);
  }
  return branchId;
}

export function useFloors(branchId: number | undefined, status: FloorStatusFilter = 'all') {
  return useQuery({
    queryKey: [...floorsKey(branchId), status],
    enabled: typeof branchId === 'number',
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantFloorsPath(branchId as number),
        listParams(status),
        signal,
      );
      return withFloorSeatCounts(branchId as number, parseFloorList(payload), signal);
    },
  });
}

export function useFloor(branchId: number | undefined, floorId: number | undefined) {
  return useQuery({
    queryKey: ['restaurant', 'floor', branchId, floorId],
    enabled: typeof branchId === 'number' && typeof floorId === 'number',
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantFloorPath(branchId as number, floorId as number),
        undefined,
        signal,
      );
      return parseFloorRecord(payload);
    },
  });
}

export function useFloorSections(branchId: number | undefined, floorId: number | undefined) {
  return useQuery({
    queryKey: ['restaurant', 'sections', branchId, floorId],
    enabled: typeof branchId === 'number' && typeof floorId === 'number',
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantFloorSectionsPath(branchId as number, floorId as number),
        { page: 1, page_size: 50 },
        signal,
      );
      return parseSectionList(payload).map(toCatalogSection);
    },
  });
}

export function useSectionTables(
  branchId: number | undefined,
  floorId: number | undefined,
  sections: readonly { id: string; name: string }[],
) {
  const sectionKey = sections.map((section) => section.id).join(',');
  return useQuery({
    queryKey: ['restaurant', 'tables', branchId, floorId, sectionKey],
    enabled: typeof branchId === 'number' && typeof floorId === 'number' && sections.length > 0,
    queryFn: async ({ signal }) => {
      const lists = await Promise.all(
        sections.map(async (section) => {
          if (!/^\d+$/.test(section.id)) return [];
          const rows = await listSectionTables(
            branchId as number,
            floorId as number,
            Number(section.id),
            signal,
          );
          return rows.map((table) =>
            toCatalogTable(
              {
                ...table,
                section_id: table.section_id ?? Number(section.id),
              },
              section.name,
            ),
          );
        }),
      );
      return lists.flat();
    },
  });
}

export function useFloorMap(
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
) {
  return useQuery({
    queryKey: ['restaurant', 'floor-map', branchId, floorId, sectionId],
    enabled:
      typeof branchId === 'number' && typeof floorId === 'number' && typeof sectionId === 'number',
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantSectionFloorMapPath(branchId as number, floorId as number, sectionId as number),
        undefined,
        signal,
      );
      return parseFloorMapTables(payload);
    },
  });
}

export function useTable(
  branchId: number | undefined,
  floorId: number | undefined,
  sectionId: number | undefined,
  tableId: number | undefined,
) {
  return useQuery({
    queryKey: ['restaurant', 'table', branchId, floorId, sectionId, tableId],
    enabled:
      typeof branchId === 'number' &&
      typeof floorId === 'number' &&
      typeof sectionId === 'number' &&
      typeof tableId === 'number',
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantSectionTablePath(
          branchId as number,
          floorId as number,
          sectionId as number,
          tableId as number,
        ),
        undefined,
        signal,
      );
      return parseTableRecord(payload);
    },
  });
}

export function useCreateTable(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; sectionId: number; body: CreateTableBody }) => {
      const payload = await api.post(
        restaurantSectionTablesPath(requireBranch(branchId), input.floorId, input.sectionId),
        input.body,
      );
      return parseTableRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useUpdateTable(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      floorId: number;
      sectionId: number;
      tableId: number;
      body: UpdateTableBody;
    }) => {
      const payload = await api.patch(
        restaurantSectionTablePath(
          requireBranch(branchId),
          input.floorId,
          input.sectionId,
          input.tableId,
        ),
        input.body,
      );
      return parseTableRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useBulkCreateTables(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      floorId: number;
      sectionId: number;
      body: BulkCreateTablesBody;
    }) => {
      const payload = await api.post(
        restaurantSectionTablesBulkPath(requireBranch(branchId), input.floorId, input.sectionId),
        input.body,
      );
      return parseTableBulk(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useBulkUpdateTables(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      floorId: number;
      sectionId: number;
      body: BulkUpdateTablesBody;
    }) => {
      const payload = await api.patch(
        restaurantSectionTablesBulkPath(requireBranch(branchId), input.floorId, input.sectionId),
        input.body,
      );
      return parseTableBulk(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useMoveTable(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      floorId: number;
      sectionId: number;
      tableId: number;
      body: MoveTableBody;
    }) => {
      const payload = await api.post(
        restaurantSectionTableMovePath(
          requireBranch(branchId),
          input.floorId,
          input.sectionId,
          input.tableId,
        ),
        input.body,
      );
      return parseTableRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useArchiveTable(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      floorId: number;
      sectionId: number;
      tableId: number;
      body: ArchiveBody;
    }) => {
      const payload = await api.post(
        restaurantSectionTableArchivePath(
          requireBranch(branchId),
          input.floorId,
          input.sectionId,
          input.tableId,
        ),
        input.body,
      );
      return parseTableRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useRestoreTable(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      floorId: number;
      sectionId: number;
      tableId: number;
      body: ArchiveBody;
    }) => {
      const payload = await api.post(
        restaurantSectionTableRestorePath(
          requireBranch(branchId),
          input.floorId,
          input.sectionId,
          input.tableId,
        ),
        input.body,
      );
      return parseTableRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateTables(queryClient, branchId, input.floorId);
    },
  });
}

export function useCreateFloor(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateFloorBody) => {
      const payload = await api.post(restaurantFloorsPath(requireBranch(branchId)), body);
      return parseFloorRecord(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: floorsKey(branchId) });
    },
  });
}

export function useUpdateFloor(branchId: number | undefined, floorId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateFloorBody) => {
      const payload = await api.patch(
        restaurantFloorPath(requireBranch(branchId), floorId as number),
        body,
      );
      return parseFloorRecord(payload);
    },
    onSuccess: async () => {
      await invalidateFloor(queryClient, branchId, floorId);
    },
  });
}

export function useArchiveFloor(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; body: ArchiveBody }) => {
      const payload = await api.post(
        restaurantFloorArchivePath(requireBranch(branchId), input.floorId),
        input.body,
      );
      return parseFloorRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateFloor(queryClient, branchId, input.floorId);
    },
  });
}

export function useRestoreFloor(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; body: ArchiveBody }) => {
      const payload = await api.post(
        restaurantFloorRestorePath(requireBranch(branchId), input.floorId),
        input.body,
      );
      return parseFloorRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateFloor(queryClient, branchId, input.floorId);
    },
  });
}

export function useCreateSection(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; body: CreateSectionBody }) => {
      const payload = await api.post(
        restaurantFloorSectionsPath(requireBranch(branchId), input.floorId),
        input.body,
      );
      return parseSectionRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateSections(queryClient, branchId, input.floorId);
    },
  });
}

export function useUpdateSection(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; sectionId: number; body: UpdateSectionBody }) => {
      const payload = await api.patch(
        restaurantFloorSectionPath(requireBranch(branchId), input.floorId, input.sectionId),
        input.body,
      );
      return parseSectionRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateSections(queryClient, branchId, input.floorId);
    },
  });
}

export function useArchiveSection(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; sectionId: number; body: ArchiveBody }) => {
      const payload = await api.post(
        restaurantFloorSectionArchivePath(requireBranch(branchId), input.floorId, input.sectionId),
        input.body,
      );
      return parseSectionRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateSections(queryClient, branchId, input.floorId);
    },
  });
}

export function useRestoreSection(branchId: number | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { floorId: number; sectionId: number; body: ArchiveBody }) => {
      const payload = await api.post(
        restaurantFloorSectionRestorePath(requireBranch(branchId), input.floorId, input.sectionId),
        input.body,
      );
      return parseSectionRecord(payload);
    },
    onSuccess: async (_data, input) => {
      await invalidateSections(queryClient, branchId, input.floorId);
    },
  });
}

async function withFloorSeatCounts(
  branchId: number,
  floors: readonly FloorListItem[],
  signal: AbortSignal,
) {
  return Promise.all(
    floors.map(async (floor) => {
      const summary = toFloorSummary(floor);
      if (summary.seatCount != null) return summary;
      try {
        const sectionIds = await floorSectionIds(branchId, floor, signal);
        const groups = await Promise.all(
          sectionIds.map((sectionId) => listSectionTables(branchId, floor.id, sectionId, signal)),
        );
        const tables = groups.flat();
        return {
          ...summary,
          tableCount: summary.tableCount ?? tables.length,
          seatCount: tables.reduce((total, table) => total + (table.capacity ?? 0), 0),
        };
      } catch {
        return { ...summary, tableCount: summary.tableCount ?? 0, seatCount: 0 };
      }
    }),
  );
}

async function floorSectionIds(branchId: number, floor: FloorListItem, signal: AbortSignal) {
  if (floor.sections && floor.sections.length > 0) {
    return floor.sections.map((section) => section.id);
  }
  const payload = await api.get(
    restaurantFloorSectionsPath(branchId, floor.id),
    { page: 1, page_size: 50 },
    signal,
  );
  return parseSectionList(payload).map((section) => section.id);
}

async function listSectionTables(
  branchId: number,
  floorId: number,
  sectionId: number,
  signal: AbortSignal,
) {
  const items: ReturnType<typeof parseTableList> = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  while (items.length < total && page <= 20) {
    const payload = await api.get(
      restaurantSectionTablesPath(branchId, floorId, sectionId),
      { page, page_size: 100 },
      signal,
    );
    const batch = parseTableListPage(payload);
    items.push(...batch.items);
    total = batch.total;
    if (batch.items.length === 0) break;
    page += 1;
  }
  return items;
}

async function invalidateFloor(
  queryClient: ReturnType<typeof useQueryClient>,
  branchId: number | undefined,
  floorId: number | undefined,
) {
  await queryClient.invalidateQueries({ queryKey: floorsKey(branchId) });
  await queryClient.invalidateQueries({ queryKey: ['restaurant', 'floor', branchId, floorId] });
}

async function invalidateTables(
  queryClient: ReturnType<typeof useQueryClient>,
  branchId: number | undefined,
  floorId: number,
) {
  await queryClient.invalidateQueries({ queryKey: ['restaurant', 'tables', branchId, floorId] });
  await queryClient.invalidateQueries({ queryKey: ['restaurant', 'floor-map', branchId, floorId] });
  await queryClient.invalidateQueries({ queryKey: ['restaurant', 'table', branchId, floorId] });
}

async function invalidateSections(
  queryClient: ReturnType<typeof useQueryClient>,
  branchId: number | undefined,
  floorId: number,
) {
  await queryClient.invalidateQueries({ queryKey: ['restaurant', 'sections', branchId, floorId] });
}
