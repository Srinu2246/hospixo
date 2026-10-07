'use server';

import { revalidatePath } from 'next/cache';

import {
  archiveFloor,
  archiveSection,
  archiveTable,
  bulkCreateTables,
  createTable,
  bulkUpdateTables,
  combineTables,
  createFloor,
  createSection,
  moveTable,
  reorderFloors,
  reorderTables,
  restoreFloor,
  restoreSection,
  restoreTable,
  rotateTableQr,
  splitTableCombination,
  updateFloor,
  updateSection,
  updateTable,
} from '@/lib/api/floors';
import {
  ApiRequestError,
  getFirstLoginActionMessage,
  getTenancyContextErrorMessage,
  getUserFriendlyErrorMessage,
} from '@/lib/api/errors';
import { tenancyContent } from '@/config/auth/tenancy';
import {
  loadFloorDetailPageData,
  resolveFloorRequestContext,
  type FloorRequestOptions,
} from '@/lib/floors-server';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';
import {
  archiveEntitySchema,
  bulkCreateTablesSchema,
  bulkUpdateTablesSchema,
  combineTablesSchema,
  createFloorSchema,
  createTableSchema,
  createSectionSchema,
  moveTableSchema,
  reorderFloorsSchema,
  reorderTablesSchema,
  updateFloorSchema,
  updateSectionSchema,
  updateTableSchema,
} from '@/lib/validation/floors';
import { floorTableSetupPath } from '@/features/floor-table-setup/lib/paths';
import {
  mapFloorFieldErrors,
  resolveApiSectionId,
} from '@/features/floor-table-setup/lib/floors-map';
import type {
  ArchiveEntityInput,
  BulkCreateTablesInput,
  BulkUpdateTablesInput,
  CombineTablesInput,
  CreateFloorInput,
  CreateTableInput,
  CreateSectionInput,
  MoveTableInput,
  ReorderFloorsInput,
  ReorderTablesInput,
  UpdateFloorInput,
  UpdateSectionInput,
  UpdateTableInput,
} from '@/types/floors';

export type FloorsActionResult = Readonly<{
  ok: boolean;
  message?: string;
  id?: string;
  version?: number;
  fieldErrors?: Readonly<Record<string, string>>;
}>;

export type FloorWizardDataResult =
  Readonly<{ ok: true; floor: Floor }> | Readonly<{ ok: false; message: string }>;

/** GET floor + sections + tables for the wizard Review / Edit steps. */
export async function loadFloorWizardDataAction(
  floorId: string,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorWizardDataResult> {
  const data = await loadFloorDetailPageData(floorId, scopeOptions);
  if (!data.floor) {
    return { ok: false, message: data.error ?? 'Unable to load this floor.' };
  }
  return { ok: true, floor: data.floor };
}

export type { FloorRequestOptions as FloorsActionScopeOptions } from '@/lib/floors-server';

async function requireScope(options: FloorRequestOptions = {}): Promise<
  | {
      ok: true;
      token: string;
      branchId: number;
      companyId: number | null;
      organizationId: number | null;
    }
  | { ok: false; message: string }
> {
  const { token, branchId, companyId, organizationId, error } = await resolveFloorRequestContext({
    activeBranchId: options.activeBranchId ?? options.preferredBranchId,
    preferredBranchId: options.preferredBranchId,
  });
  if (!token) {
    return { ok: false, message: 'Sign in required.' };
  }

  if (branchId == null) {
    return { ok: false, message: error ?? tenancyContent.branchRequiredForFloors };
  }

  return { ok: true, token, branchId, companyId, organizationId };
}

async function runFloorMutation<T>(fn: () => Promise<T>): Promise<T> {
  return fn();
}

function revalidateFloorRoutes(floorId?: string) {
  const hub = floorTableSetupPath();
  revalidatePath(hub);
  if (floorId) {
    revalidatePath(`${hub}/${floorId}`);
  }
}

function toConflictMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError && error.status === 409) {
    return getUserFriendlyErrorMessage(error, fallback);
  }
  return (
    getFirstLoginActionMessage(error) ??
    getTenancyContextErrorMessage(error) ??
    getUserFriendlyErrorMessage(error, fallback)
  );
}

function toFloorNameConflictMessage(error: unknown, fallback: string) {
  if (error instanceof ApiRequestError && error.status === 409) {
    return 'A floor or section with this name or code already exists.';
  }
  return toConflictMessage(error, fallback);
}

function zodFieldErrors(error: {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}) {
  return Object.fromEntries(
    error.issues.map((issue) => [String(issue.path[0] ?? 'name'), issue.message]),
  );
}

function archiveBody(version = 1): ArchiveEntityInput {
  const parsed = archiveEntitySchema.safeParse({ version });
  return parsed.success ? parsed.data : { version: 1 };
}

/** POST create floor for the signed-in branch. */
export async function createFloorAction(
  input: CreateFloorInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  return runFloorMutation(async () => {
    const parsed = createFloorSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const scope = await requireScope(scopeOptions);
    if (!scope.ok) return { ok: false, message: scope.message };

    try {
      const floor = await createFloor(scope.token, scope.branchId, parsed.data);
      revalidateFloorRoutes(String(floor.id));
      return { ok: true, id: String(floor.id) };
    } catch (error) {
      return {
        ok: false,
        message: toFloorNameConflictMessage(error, 'Unable to create floor.'),
        fieldErrors: mapFloorFieldErrors(error),
      };
    }
  });
}

/** PUT update floor. */
export async function updateFloorAction(
  floorId: string,
  input: UpdateFloorInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = updateFloorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await updateFloor(scope.token, scope.branchId, floorId, parsed.data);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: floorId };
  } catch (error) {
    return {
      ok: false,
      message: toFloorNameConflictMessage(error, 'Unable to update floor.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** POST archive floor. */
export async function archiveFloorAction(
  floorId: string,
  scopeOptions: FloorRequestOptions = {},
  version = 1,
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await archiveFloor(scope.token, scope.branchId, floorId, archiveBody(version));
    revalidateFloorRoutes(floorId);
    return { ok: true, id: floorId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to archive floor.') };
  }
}

/** POST restore floor. */
export async function restoreFloorAction(
  floorId: string,
  scopeOptions: FloorRequestOptions = {},
  version = 1,
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await restoreFloor(scope.token, scope.branchId, floorId, archiveBody(version));
    revalidateFloorRoutes(floorId);
    return { ok: true, id: floorId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to restore floor.') };
  }
}

/** POST reorder floors for the signed-in branch. */
export async function reorderFloorsAction(
  input: ReorderFloorsInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = reorderFloorsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Unable to reorder floors.',
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await reorderFloors(scope.token, scope.branchId, { items: parsed.data.items });
    revalidateFloorRoutes();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to reorder floors.') };
  }
}

/** POST create section. */
export async function createSectionAction(
  floorId: string,
  input: CreateSectionInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  return runFloorMutation(async () => {
    const parsed = createSectionSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const scope = await requireScope(scopeOptions);
    if (!scope.ok) return { ok: false, message: scope.message };

    try {
      const section = await createSection(scope.token, scope.branchId, floorId, parsed.data);
      const sectionId = resolveApiSectionId(section);
      if (!sectionId) {
        return { ok: false, message: 'Unable to create section.' };
      }
      revalidateFloorRoutes(floorId);
      return { ok: true, id: sectionId };
    } catch (error) {
      return {
        ok: false,
        message: toFloorNameConflictMessage(error, 'Unable to create section.'),
        fieldErrors: mapFloorFieldErrors(error),
      };
    }
  });
}

/** PUT update section. */
export async function updateSectionAction(
  floorId: string,
  sectionId: string,
  input: UpdateSectionInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = updateSectionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await updateSection(scope.token, scope.branchId, floorId, sectionId, parsed.data);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: sectionId };
  } catch (error) {
    return {
      ok: false,
      message: toFloorNameConflictMessage(error, 'Unable to update section.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** POST archive section. */
export async function archiveSectionAction(
  floorId: string,
  sectionId: string,
  scopeOptions: FloorRequestOptions = {},
  version = 1,
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await archiveSection(scope.token, scope.branchId, floorId, sectionId, archiveBody(version));
    revalidateFloorRoutes(floorId);
    return { ok: true, id: sectionId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to archive section.') };
  }
}

/** POST restore section. */
export async function restoreSectionAction(
  floorId: string,
  sectionId: string,
  scopeOptions: FloorRequestOptions = {},
  version = 1,
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await restoreSection(scope.token, scope.branchId, floorId, sectionId, archiveBody(version));
    revalidateFloorRoutes(floorId);
    return { ok: true, id: sectionId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to restore section.') };
  }
}

/** POST bulk create dining tables for a section. */
export async function bulkCreateTablesAction(
  floorId: string,
  sectionId: string,
  input: BulkCreateTablesInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  return runFloorMutation(async () => {
    const parsed = bulkCreateTablesSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
        fieldErrors: zodFieldErrors(parsed.error),
      };
    }

    const scope = await requireScope(scopeOptions);
    if (!scope.ok) return { ok: false, message: scope.message };

    try {
      if (parsed.data.items.length === 1 && parsed.data.items[0]) {
        await createTable(scope.token, scope.branchId, floorId, sectionId, parsed.data.items[0]);
      } else {
        await bulkCreateTables(scope.token, scope.branchId, floorId, sectionId, {
          items: parsed.data.items,
        });
      }
      revalidateFloorRoutes(floorId);
      return { ok: true, id: sectionId };
    } catch (error) {
      return {
        ok: false,
        message: toConflictMessage(error, 'Unable to create tables.'),
        fieldErrors: mapFloorFieldErrors(error),
      };
    }
  });
}

/** POST create a single dining table. */
export async function createTableAction(
  floorId: string,
  sectionId: string,
  input: CreateTableInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = createTableSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    const table = await createTable(scope.token, scope.branchId, floorId, sectionId, parsed.data);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: String(table.id ?? '') };
  } catch (error) {
    return {
      ok: false,
      message: toConflictMessage(error, 'Unable to create this table.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** PATCH bulk update dining tables for a section. */
export async function bulkUpdateTablesAction(
  floorId: string,
  sectionId: string,
  input: BulkUpdateTablesInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = bulkUpdateTablesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await bulkUpdateTables(scope.token, scope.branchId, floorId, sectionId, parsed.data);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: sectionId };
  } catch (error) {
    return {
      ok: false,
      message: toConflictMessage(error, 'Unable to update tables.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** PATCH update a single dining table. */
export async function updateTableAction(
  floorId: string,
  sectionId: string,
  tableId: string,
  input: UpdateTableInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = updateTableSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    const updated = await updateTable(
      scope.token,
      scope.branchId,
      floorId,
      sectionId,
      tableId,
      parsed.data,
    );
    revalidateFloorRoutes(floorId);
    const version =
      updated &&
      typeof updated === 'object' &&
      'version' in updated &&
      typeof updated.version === 'number'
        ? updated.version
        : undefined;
    return { ok: true, id: tableId, version };
  } catch (error) {
    return {
      ok: false,
      message: toConflictMessage(error, 'Unable to update this table.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** POST move a dining table to another section. */
export async function moveTableAction(
  floorId: string,
  sectionId: string,
  tableId: string,
  input: MoveTableInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = moveTableSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    const moved = await moveTable(
      scope.token,
      scope.branchId,
      floorId,
      sectionId,
      tableId,
      parsed.data,
    );
    revalidateFloorRoutes(floorId);
    const version =
      moved && typeof moved === 'object' && 'version' in moved && typeof moved.version === 'number'
        ? moved.version
        : undefined;
    return { ok: true, id: tableId, version };
  } catch (error) {
    return {
      ok: false,
      message: toConflictMessage(error, 'Unable to move this table.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** POST archive dining table. */
export async function archiveTableAction(
  floorId: string,
  sectionId: string,
  tableId: string,
  scopeOptions: FloorRequestOptions = {},
  version = 1,
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await archiveTable(
      scope.token,
      scope.branchId,
      floorId,
      sectionId,
      tableId,
      archiveBody(version),
    );
    revalidateFloorRoutes(floorId);
    return { ok: true, id: tableId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to archive this table.') };
  }
}

/** POST restore dining table. */
export async function restoreTableAction(
  floorId: string,
  sectionId: string,
  tableId: string,
  scopeOptions: FloorRequestOptions = {},
  version = 1,
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await restoreTable(
      scope.token,
      scope.branchId,
      floorId,
      sectionId,
      tableId,
      archiveBody(version),
    );
    revalidateFloorRoutes(floorId);
    return { ok: true, id: tableId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to restore this table.') };
  }
}

/** POST rotate table QR code. */
export async function rotateTableQrAction(
  floorId: string,
  sectionId: string,
  tableId: string,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await rotateTableQr(scope.token, scope.branchId, floorId, sectionId, tableId);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: tableId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to rotate this table QR code.') };
  }
}

/** PUT reorder dining tables in a section. */
export async function reorderTablesAction(
  floorId: string,
  sectionId: string,
  input: ReorderTablesInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = reorderTablesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Unable to reorder tables.',
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await reorderTables(scope.token, scope.branchId, floorId, sectionId, parsed.data);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: sectionId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to reorder tables.') };
  }
}

/** POST combine dining tables in a section. */
export async function combineTablesAction(
  floorId: string,
  sectionId: string,
  input: CombineTablesInput,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const parsed = combineTablesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
      fieldErrors: zodFieldErrors(parsed.error),
    };
  }

  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    const combination = await combineTables(
      scope.token,
      scope.branchId,
      floorId,
      sectionId,
      parsed.data,
    );
    revalidateFloorRoutes(floorId);
    return { ok: true, id: String(combination.id ?? '') };
  } catch (error) {
    return {
      ok: false,
      message: toConflictMessage(error, 'Unable to combine tables.'),
      fieldErrors: mapFloorFieldErrors(error),
    };
  }
}

/** POST split a table combination. */
export async function splitTableCombinationAction(
  floorId: string,
  sectionId: string,
  combinationId: string,
  scopeOptions: FloorRequestOptions = {},
): Promise<FloorsActionResult> {
  const scope = await requireScope(scopeOptions);
  if (!scope.ok) return { ok: false, message: scope.message };

  try {
    await splitTableCombination(scope.token, scope.branchId, floorId, sectionId, combinationId);
    revalidateFloorRoutes(floorId);
    return { ok: true, id: combinationId };
  } catch (error) {
    return { ok: false, message: toConflictMessage(error, 'Unable to split this combination.') };
  }
}
