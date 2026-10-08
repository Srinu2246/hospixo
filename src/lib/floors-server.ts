/**
 * Server-only Floors data loaders.
 * Call from RSC / Server Actions with the httpOnly session cookie — never from the browser.
 */

import {
  isMockDashboardOutletId,
  parseBranchRouteSearchParams,
  toPositiveBranchId,
} from '@/lib/api/branch-tenancy';
import { authorizeBranchAccess } from '@/lib/branch-access';
import { getFloor, listFloors, listSectionTables, listSections } from '@/lib/api/floors';
import {
  getFirstLoginActionMessage,
  getTenancyContextErrorMessage,
  getUserFacingErrorMessage,
} from '@/lib/api/errors';
import { resolveAccessLevel } from '@/lib/auth/access-level';
import { getServerAuthSession } from '@/lib/auth/session';
import { tenancyContent } from '@/config/auth/tenancy';
import type { AuthSession } from '@/types/platform-auth';
import type { ApiFloor, ApiFloorSection } from '@/types/floors';
import {
  mapApiFloorToFloor,
  mapApiSectionToSection,
  mapApiTableToFloorTable,
  enrichApiSectionsWithTableStats,
  resolveApiSectionId,
} from '@/features/floor-table-setup/lib/floors-map';
import { logger } from '@/lib/logger';
import type { Floor } from '@/features/floor-table-setup/types/floor-table-setup';

export type FloorsListPageData = Readonly<{
  floors: readonly Floor[];
  branchId: number | null;
  companyId: number | null;
  error: string | null;
}>;

export type FloorDetailPageData = Readonly<{
  floor: Floor | undefined;
  branchId: number | null;
  companyId: number | null;
  error: string | null;
}>;

export type FloorRequestContext = Readonly<{
  token: string | null;
  branchId: number | null;
  companyId: number | null;
  organizationId: number | null;
  error: string | null;
}>;

export type FloorRequestOptions = Readonly<{
  /** Picker / `?outlet=` working branch — not `user.branch_id`. */
  activeBranchId?: number | string | null;
  /** @deprecated Use `activeBranchId`. */
  preferredBranchId?: number | string | null;
}>;

/** Parse branch route search params into floor loader options. */
export function parseFloorRequestOptions(searchParams: {
  outlet?: string;
  branch_id?: string;
}): FloorRequestOptions {
  const branchId = parseBranchRouteSearchParams(searchParams);
  return branchId != null ? { activeBranchId: branchId, preferredBranchId: branchId } : {};
}

function toPositiveId(value: unknown): number | null {
  return toPositiveBranchId(value);
}

function mapContextError(err: unknown, fallback: string): string {
  return (
    getFirstLoginActionMessage(err) ??
    getTenancyContextErrorMessage(err) ??
    getUserFacingErrorMessage(err, fallback)
  );
}

/**
 * Working branch for floor APIs: picker / URL `activeBranchId` only.
 * Profile `user.branch_id` is used solely for branch-scoped roles (their only branch).
 * Org/company admins are never auto-assigned a branch.
 */
async function resolveBranchAndCompanyIds(
  session: AuthSession,
  selectedBranchId?: number | string | null,
): Promise<{ branchId: number | null; companyId: number | null; error: string | null }> {
  const user = session.user;
  const sessionCompanyId = toPositiveId(user.company_id);
  const level = resolveAccessLevel(user);

  if (
    typeof selectedBranchId === 'string' &&
    selectedBranchId.trim() !== '' &&
    isMockDashboardOutletId(selectedBranchId)
  ) {
    return {
      branchId: null,
      companyId: sessionCompanyId,
      error: tenancyContent.branchRequiredForFloors,
    };
  }

  const pickerBranchId = toPositiveId(selectedBranchId);
  const profileBranchId = toPositiveId(user.branch_id);
  const isBranchScoped =
    level === 'branch' || level === 'counter' || level === 'captain' || level === 'kitchen';

  const branchId = pickerBranchId ?? (isBranchScoped ? profileBranchId : null);
  if (branchId == null) {
    return {
      branchId: null,
      companyId: sessionCompanyId,
      error: tenancyContent.branchRequiredForFloors,
    };
  }

  const access = await authorizeBranchAccess(user, branchId, { token: session.accessToken });
  if (!access.ok) {
    return {
      branchId: null,
      companyId: sessionCompanyId,
      error: access.message,
    };
  }

  return {
    branchId,
    companyId: sessionCompanyId,
    error: null,
  };
}

/**
 * Cookie token + picker `activeBranchId` (`?outlet=` / action scope).
 * Does not invent a branch from `user.branch_id` for org/company admins.
 */
export async function resolveFloorRequestContext(
  options: FloorRequestOptions = {},
): Promise<FloorRequestContext> {
  const session = await getServerAuthSession();
  const token = session?.accessToken ?? null;

  if (!token || !session) {
    return { token, branchId: null, companyId: null, organizationId: null, error: null };
  }

  const resolved = await resolveBranchAndCompanyIds(
    session,
    options.activeBranchId ?? options.preferredBranchId,
  );
  return {
    token,
    branchId: resolved.branchId,
    companyId: resolved.companyId,
    organizationId: toPositiveId(session.user.org_id),
    error: resolved.error,
  };
}

export async function resolveSessionBranchId(
  options: FloorRequestOptions = {},
): Promise<number | null> {
  const { branchId } = await resolveFloorRequestContext(options);
  return branchId;
}

async function mapFloorListItem(
  token: string,
  branchId: number,
  apiFloor: ApiFloor,
): Promise<Floor> {
  const floorId = apiFloor.id;
  if (floorId == null || floorId === '') {
    return mapApiFloorToFloor(apiFloor);
  }

  try {
    const sections = await listSections(token, branchId, floorId);
    const sectionItems = sections.items.length > 0 ? sections.items : (apiFloor.sections ?? []);

    let tableCount = sectionItems.reduce((sum, section) => sum + (section.table_count ?? 0), 0);
    let seatCount = sectionItems.reduce((sum, section) => sum + (section.seat_count ?? 0), 0);

    if (tableCount === 0 && sectionItems.length > 0) {
      const tableLists = await Promise.all(
        sectionItems.map((section) => {
          const sectionId = resolveApiSectionId(section);
          if (!sectionId) {
            return Promise.resolve({ items: [], total: 0 });
          }
          return listSectionTables(token, branchId, floorId, sectionId).catch((error) => {
            logger.api.warn('listSectionTables failed', { floorId, sectionId, error });
            return { items: [], total: 0 };
          });
        }),
      );
      tableCount = tableLists.reduce((sum, list) => sum + list.items.length, 0);
      seatCount = tableLists.reduce(
        (sum, list) =>
          sum + list.items.reduce((seatSum, table) => seatSum + (table.capacity ?? 0), 0),
        0,
      );
    }

    return mapApiFloorToFloor({
      ...apiFloor,
      sections: sectionItems,
      table_count: tableCount,
      seat_count: seatCount,
    });
  } catch {
    return mapApiFloorToFloor(apiFloor);
  }
}

/** Load floors for the signed-in user's branch. */
export async function loadFloorsPageData(
  options: FloorRequestOptions = {},
): Promise<FloorsListPageData> {
  const { token, branchId, companyId, error } = await resolveFloorRequestContext(options);

  if (!token) {
    return { floors: [], branchId, companyId, error: 'Sign in required.' };
  }

  if (branchId == null) {
    return {
      floors: [],
      branchId,
      companyId,
      error: error ?? tenancyContent.branchRequiredForFloors,
    };
  }

  try {
    const list = await listFloors(token, branchId);
    const floors = await Promise.all(
      list.items.map((apiFloor) => mapFloorListItem(token, branchId, apiFloor)),
    );

    return {
      floors,
      branchId,
      companyId,
      error: null,
    };
  } catch (err) {
    return {
      floors: [],
      branchId,
      companyId,
      error: mapContextError(err, 'Unable to load floors.'),
    };
  }
}

async function loadTablesForFloorSections(
  token: string,
  branchId: number,
  floorId: string,
  sectionItems: readonly ApiFloorSection[],
): Promise<ReturnType<typeof mapApiTableToFloorTable>[]> {
  if (sectionItems.length === 0) return [];

  const tableLists = await Promise.all(
    sectionItems.map((section) => {
      const sectionId = resolveApiSectionId(section);
      if (!sectionId) {
        return Promise.resolve({ items: [], total: 0 });
      }
      return listSectionTables(token, branchId, floorId, sectionId).catch((error) => {
        logger.api.warn('listSectionTables failed', { floorId, sectionId, error });
        return { items: [], total: 0 };
      });
    }),
  );

  return tableLists.flatMap((list, index) => {
    const apiSection = sectionItems[index];
    if (!apiSection) return [];
    const section = mapApiSectionToSection(apiSection, index);
    return list.items.map((table, tableIndex) =>
      mapApiTableToFloorTable(table, section, tableIndex),
    );
  });
}

/** Load a single floor for the detail page. */
export async function loadFloorDetailPageData(
  floorId: string,
  options: FloorRequestOptions = {},
): Promise<FloorDetailPageData> {
  const { token, branchId, companyId, error } = await resolveFloorRequestContext(options);

  if (!token) {
    return { floor: undefined, branchId, companyId, error: 'Sign in required.' };
  }

  if (branchId == null) {
    return {
      floor: undefined,
      branchId,
      companyId,
      error: error ?? tenancyContent.branchRequiredForFloors,
    };
  }

  try {
    const [apiFloor, sections] = await Promise.all([
      getFloor(token, branchId, floorId),
      listSections(token, branchId, floorId).catch(() => ({ items: [], total: 0 })),
    ]);
    let sectionItems = sections.items.length > 0 ? sections.items : (apiFloor.sections ?? []);

    const tables = await loadTablesForFloorSections(token, branchId, floorId, sectionItems);
    sectionItems = enrichApiSectionsWithTableStats(sectionItems, tables);

    const seatCount = tables.reduce((sum, table) => sum + table.capacity, 0);
    const floor = mapApiFloorToFloor({
      ...apiFloor,
      sections: sectionItems,
      table_count: tables.length,
      seat_count: seatCount,
    });
    return { floor: { ...floor, tables }, branchId, companyId, error: null };
  } catch (err) {
    return {
      floor: undefined,
      branchId,
      companyId,
      error: mapContextError(err, 'Unable to load this floor.'),
    };
  }
}
