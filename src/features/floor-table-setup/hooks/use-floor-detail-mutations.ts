'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  buildBulkCreateTablesInput,
  buildBulkUpdateTablesInput,
  buildCombineTablesInput,
  buildCreateSectionInput,
  buildMoveTableInput,
  buildUpdateFloorInput,
  buildUpdateSectionInput,
  buildUpdateTableInputFromEdit,
} from '@/features/floor-table-setup/lib/floors-map';
import {
  useFloorActionScope,
  type FloorActionScopeOptions,
} from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';
import type {
  Floor,
  FloorDraftForm,
  FloorTableItem,
  SectionDraft,
  TableDraft,
} from '@/features/floor-table-setup/types/floor-table-setup';
import {
  archiveSectionAction,
  archiveTableAction,
  bulkCreateTablesAction,
  bulkUpdateTablesAction,
  combineTablesAction,
  createSectionAction,
  rotateTableQrAction,
  splitTableCombinationAction,
  updateFloorAction,
  updateSectionAction,
  updateTableAction,
  moveTableAction,
  type FloorsActionResult,
} from '@/lib/floors-actions';
import { generateTables } from '@/features/floor-table-setup/lib/draft';

type MutationRunner = (scope: FloorActionScopeOptions) => Promise<FloorsActionResult>;

export function useFloorDetailMutations(floorId: string) {
  const router = useRouter();
  const scope = useFloorActionScope();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (mutation: MutationRunner): Promise<FloorsActionResult> => {
      if (!scope.activeBranchId) {
        const message = 'Select a branch before making changes.';
        setError(message);
        return { ok: false, message };
      }

      setIsPending(true);
      setError(null);
      try {
        const result = await mutation(scope);
        if (!result.ok) {
          setError(result.message ?? 'Unable to complete this action.');
          return result;
        }
        router.refresh();
        return result;
      } finally {
        setIsPending(false);
      }
    },
    [router, scope],
  );

  const run = useCallback(
    async (mutation: MutationRunner): Promise<boolean> => {
      const result = await execute(mutation);
      return result.ok;
    },
    [execute],
  );

  const updateFloor = useCallback(
    (form: FloorDraftForm, version: number) =>
      run((actionScope) =>
        updateFloorAction(floorId, buildUpdateFloorInput(form, version), actionScope),
      ),
    [floorId, run],
  );

  const createSection = useCallback(
    (input: { name: string; code: string; description: string; active: boolean }) =>
      run((actionScope) =>
        createSectionAction(floorId, buildCreateSectionInput(input), actionScope),
      ),
    [floorId, run],
  );

  const createSectionId = useCallback(
    async (input: { name: string; code: string; description: string; active: boolean }) => {
      const result = await execute((actionScope) =>
        createSectionAction(floorId, buildCreateSectionInput(input), actionScope),
      );
      return result.ok && result.id ? result.id : null;
    },
    [execute, floorId],
  );

  const updateSection = useCallback(
    (sectionId: string, draft: SectionDraft) =>
      run((actionScope) =>
        updateSectionAction(
          floorId,
          sectionId,
          buildUpdateSectionInput(
            {
              name: draft.name,
              code: draft.code,
              description: draft.description,
              active: draft.active,
            },
            draft.version ?? 1,
          ),
          actionScope,
        ),
      ),
    [floorId, run],
  );

  const archiveSection = useCallback(
    (sectionId: string, version = 1) =>
      run((actionScope) => archiveSectionAction(floorId, sectionId, actionScope, version)),
    [floorId, run],
  );

  const createTables = useCallback(
    (sectionId: string, generated: readonly TableDraft[]) =>
      run((actionScope) =>
        bulkCreateTablesAction(
          floorId,
          sectionId,
          buildBulkCreateTablesInput(generated),
          actionScope,
        ),
      ),
    [floorId, run],
  );

  const createTablesFromModal = useCallback(
    (
      sectionId: string,
      value: {
        startNumber: string;
        count: number;
        capacity: number;
        existing: readonly Pick<TableDraft, 'number'>[];
      },
    ) => {
      const generated = generateTables({
        startNumber: value.startNumber,
        count: value.count,
        capacity: value.capacity,
        reservations: false,
        existing: value.existing,
      });
      return createTables(sectionId, generated);
    },
    [createTables],
  );

  const updateTable = useCallback(
    (
      sectionId: string,
      tableId: string,
      table: Pick<
        FloorTableItem,
        'number' | 'capacity' | 'shape' | 'configStatus' | 'reservations'
      >,
      version: number,
    ) =>
      run((actionScope) =>
        updateTableAction(
          floorId,
          sectionId,
          tableId,
          buildUpdateTableInputFromEdit(table, version),
          actionScope,
        ),
      ),
    [floorId, run],
  );

  const moveTable = useCallback(
    (currentSectionId: string, tableId: string, targetSectionId: string, _version: number) =>
      run((actionScope) =>
        moveTableAction(
          floorId,
          currentSectionId,
          tableId,
          buildMoveTableInput(targetSectionId),
          actionScope,
        ),
      ),
    [floorId, run],
  );

  const bulkUpdateTables = useCallback(
    (sectionId: string, tables: readonly FloorTableItem[]) =>
      run((actionScope) =>
        bulkUpdateTablesAction(floorId, sectionId, buildBulkUpdateTablesInput(tables), actionScope),
      ),
    [floorId, run],
  );

  const archiveTable = useCallback(
    (sectionId: string, tableId: string, version = 1) =>
      run((actionScope) => archiveTableAction(floorId, sectionId, tableId, actionScope, version)),
    [floorId, run],
  );

  const combineTables = useCallback(
    (sectionId: string, tableIds: readonly string[]) =>
      run((actionScope) =>
        combineTablesAction(floorId, sectionId, buildCombineTablesInput(tableIds), actionScope),
      ),
    [floorId, run],
  );

  const splitCombination = useCallback(
    (sectionId: string, combinationId: string) =>
      run((actionScope) =>
        splitTableCombinationAction(floorId, sectionId, combinationId, actionScope),
      ),
    [floorId, run],
  );

  const rotateTableQr = useCallback(
    (sectionId: string, tableId: string) =>
      run((actionScope) => rotateTableQrAction(floorId, sectionId, tableId, actionScope)),
    [floorId, run],
  );

  return {
    scope,
    scopeReady: scope.activeBranchId != null,
    isPending,
    error,
    clearError: () => setError(null),
    updateFloor,
    createSection,
    createSectionId,
    updateSection,
    archiveSection,
    bulkCreateTables: createTables,
    createTablesFromModal,
    updateTable,
    moveTable,
    bulkUpdateTables,
    archiveTable,
    combineTables,
    splitCombination,
    rotateTableQr,
  };
}

export type FloorDetailMutations = ReturnType<typeof useFloorDetailMutations>;
