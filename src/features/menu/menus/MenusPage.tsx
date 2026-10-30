'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { MenuCard } from '@/components/features/menu/menus/MenuCard';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import { menuPageHeaderGridSx, menuWorkspaceBottomNavPbSx } from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import {
  branchMenusQueryKey,
  restaurantMenusQueryKey,
  useActiveBranchId,
  useBranchMenus,
  useCreateRestaurantMenu,
  useRestaurantMenus,
  useSetRestaurantMenuActive,
} from '@/lib/hooks/menu/menus/menusHooks';
import { MENU_STATUS_FILTER_OPTIONS, type MenuStatusFilter } from '@/lib/mocks/menu/menu.mocks';
import type {
  MenuAssignment,
  MenuSessionFormValues,
  PagedMenusData,
} from '@/lib/schemas/menu/menus/menusSchema';
import { useToastStore } from '@/stores/toastStore';

import { CreateMenuSessionForm } from './CreateMenuSessionForm';
import { MenuSessionDetailPage } from './MenuSessionDetailPage';

type MenusMode = 'list' | 'create' | 'edit' | 'detail';

function parseMenusPath(pathname: string): {
  basePath: string;
  mode: MenusMode;
  menuId?: number;
} {
  const marker = '/menu/menus';
  const idx = pathname.indexOf(marker);
  const basePath = idx >= 0 ? pathname.slice(0, idx + marker.length) : pathname.replace(/\/$/, '');
  const rest = idx >= 0 ? pathname.slice(idx + marker.length) : '';

  if (rest === '/create' || rest.startsWith('/create/')) {
    return { basePath, mode: 'create' };
  }

  const editMatch = rest.match(/^\/(\d+)\/edit\/?$/);
  if (editMatch) {
    const menuId = Number(editMatch[1]);
    if (Number.isFinite(menuId) && menuId > 0) {
      return { basePath, mode: 'edit', menuId };
    }
  }

  const detailMatch = rest.match(/^\/(\d+)\/?$/);
  if (detailMatch) {
    const menuId = Number(detailMatch[1]);
    if (Number.isFinite(menuId) && menuId > 0) {
      return { basePath, mode: 'detail', menuId };
    }
  }

  return { basePath, mode: 'list' };
}

function resolveMenusPageScope(pathname: string): MenuCataloguePageScope {
  if (pathname.includes('/company/')) return 'company';
  if (pathname.includes('/branch-manager/') || pathname.startsWith('branch/')) return 'branch';
  if (pathname.includes('/organization/')) return 'organization';
  return 'branch';
}

/**
 * Menus list / create / edit
 * Branch list: GET /v1/restaurant/branches/{branch_id}/menus
 * Company list: GET /v1/restaurant/menus
 */
export function MenusPage() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const branchId = useActiveBranchId();
  const { basePath, mode, menuId } = parseMenusPath(pathname);
  const pageScope = resolveMenusPageScope(pathname);
  const createMenuMutation = useCreateRestaurantMenu();
  const setMenuActiveMutation = useSetRestaurantMenuActive();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 1500);
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [submitting, setSubmitting] = useState(false);

  const isListMode = mode === 'list';
  const listParams = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: isListMode && debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      page: isListMode ? page : 1,
      page_size: isListMode ? pageSize : 50,
    }),
    [debouncedSearch, isListMode, page, pageSize, statusFilter],
  );

  const isBranchScope = pageScope === 'branch';
  const menuCountParams = useMemo(() => ({ page: 1, page_size: 1 }), []);
  const branchMenusQuery = useBranchMenus(listParams, branchId);
  const companyMenusQuery = useRestaurantMenus(listParams);
  const branchMenuCountQuery = useBranchMenus(menuCountParams, branchId);
  const companyMenuCountQuery = useRestaurantMenus(menuCountParams);
  const menusQuery = isBranchScope ? branchMenusQuery : companyMenusQuery;
  const menus = useMemo(() => menusQuery.data?.items ?? [], [menusQuery.data?.items]);
  const menusTotal = menusQuery.data?.total ?? 0;
  const menusCatalogTotal = isBranchScope
    ? (branchMenuCountQuery.data?.total ?? 0)
    : (companyMenuCountQuery.data?.total ?? 0);

  const activeMenu = useMemo(
    () =>
      (mode === 'edit' || mode === 'detail') && menuId != null
        ? menus.find((row) => row.id === menuId)
        : undefined,
    [mode, menuId, menus],
  );

  const visibleMenus = menus;

  function goToList() {
    router.push(basePath);
  }

  function patchMenusCache(updater: (rows: MenuAssignment[]) => MenuAssignment[]) {
    const queryKey = isBranchScope
      ? branchMenusQueryKey(branchId, listParams)
      : restaurantMenusQueryKey(listParams);
    queryClient.setQueryData<PagedMenusData>(queryKey, (current) => {
      const items = updater(current?.items ?? []);
      return {
        items,
        total: current?.total ?? items.length,
        page: current?.page ?? 1,
        page_size: current?.page_size ?? pageSize,
      };
    });
  }

  async function toggleStatus(target: MenuAssignment) {
    const isActive = target.status.toLowerCase() === 'active';

    try {
      const updated = await setMenuActiveMutation.mutateAsync({
        pageScope,
        active: !isActive,
        ...(isBranchScope
          ? { branchId, assignmentId: target.id }
          : { menuId: target.menu_id ?? target.id }),
      });
      patchMenusCache((prev) =>
        prev.map((row) =>
          row.id === target.id || row.menu_id === updated.menu_id ? updated : row,
        ),
      );
      showToast(
        `${updated.menu.name} ${!isActive ? 'activated' : 'deactivated'} successfully`,
        'success',
      );
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  async function handleCreate(values: MenuSessionFormValues) {
    setSubmitting(true);
    try {
      await createMenuMutation.mutateAsync({
        values,
        pageScope,
        branchId: pageScope === 'branch' ? branchId : undefined,
      });
      showToast(`Created “${values.name}” menu`, 'success');
      goToList();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSave(values: MenuSessionFormValues) {
    if (menuId == null) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    patchMenusCache((prev) =>
      prev.map((row) =>
        row.id === menuId
          ? {
              ...row,
              updated_at: now,
              menu: {
                ...row.menu,
                name: values.name,
                code: values.code.toUpperCase(),
                menu_type: values.menuType.toLowerCase(),
                description: values.description || null,
                updated_at: now,
              },
            }
          : row,
      ),
    );
    setSubmitting(false);
    showToast(`Saved “${values.name}” session`, 'success');
    goToList();
  }

  if (mode === 'create') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <CreateMenuSessionForm
          mode="create"
          submitting={submitting}
          onCancel={goToList}
          onSubmit={handleCreate}
        />
      </Box>
    );
  }

  if (mode === 'detail' || mode === 'edit') {
    if (menusQuery.isPending) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress size={28} />
        </Box>
      );
    }

    if (!activeMenu) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: 'background.default',
          }}
        >
          <AlertMessage
            variant="error"
            title="Menu session not found"
            message="This session may have been removed or the link is invalid."
          />
          <ActionButton onClick={goToList} sx={{ alignSelf: 'flex-start' }}>
            Back to Menus
          </ActionButton>
        </Box>
      );
    }

    if (mode === 'detail') {
      return (
        <MenuSessionDetailPage
          menu={activeMenu}
          menusBasePath={basePath}
          onEdit={() => router.push(`${basePath}/${activeMenu.id}/edit`)}
          onToggleStatus={() => toggleStatus(activeMenu)}
        />
      );
    }

    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <CreateMenuSessionForm
          mode="edit"
          initialValues={{
            name: activeMenu.menu.name,
            code: activeMenu.menu.code ?? '',
            menuType: activeMenu.menu.menu_type || 'all',
            description: activeMenu.menu.description ?? '',
          }}
          submitting={submitting}
          onCancel={goToList}
          onSubmit={handleSave}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
        bgcolor: 'background.default',
        boxSizing: 'border-box',
        ...menuWorkspaceBottomNavPbSx,
      }}
    >
      <Box sx={{ ...menuPageHeaderGridSx, flexShrink: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.375rem', sm: '1.5rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            Menus
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}
          >
            Define meal sessions and assign menu items to control availability by time of day.
          </Typography>
        </Box>

        <ActionButton
          startIcon={<Plus size={16} />}
          onClick={() => router.push(`${basePath}/create`)}
          size="small"
          sx={{
            flexShrink: 0,
            px: { [screen.mobile]: 1.25, [screen.tablet]: 1.5, [screen.desktop]: 2 },
            fontSize: { [screen.mobile]: '0.8125rem', [screen.tablet]: '0.875rem' },
          }}
        >
          Create Menus
        </ActionButton>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{
          flexShrink: 0,
          alignItems: { sm: 'center' },
          width: '100%',
          pr: { xs: 0, sm: 0.5 },
        }}
      >
        <SearchBar
          value={search}
          onChange={(value: string) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search sessions..."
          showClear
          fullWidth
          width="100%"
          sx={{
            flex: { sm: 1 },
            minWidth: { sm: 220, md: 280 },
            maxWidth: { sm: '100%', md: 480 },
          }}
          inputSx={{ pl: 0.25 }}
        />
        <Dropdown
          options={[...MENU_STATUS_FILTER_OPTIONS]}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value as MenuStatusFilter);
            setPage(1);
          }}
          prefix="Status:"
          size="medium"
          minWidth={160}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
          }}
        />
      </Stack>

      {menusQuery.isError ? (
        <AlertMessage
          variant="error"
          title="Unable to load menus"
          message={
            menusQuery.error instanceof Error
              ? menusQuery.error.message
              : 'Could not load branch menus.'
          }
        />
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {menusQuery.isPending ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : visibleMenus.length === 0 ? (
          <AlertMessage
            variant="info"
            title="No menus found"
            message={
              search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Create a meal session to get started.'
            }
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
              pb: 1,
            }}
          >
            {visibleMenus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onView={(row) => router.push(`${basePath}/${row.id}`)}
                onEdit={(row) => router.push(`${basePath}/${row.id}/edit`)}
                onDeactivate={toggleStatus}
                onActivate={toggleStatus}
              />
            ))}
          </Box>
        )}
      </Box>

      {isListMode && menusTotal > 0 ? (
        <TablePagination
          page={page}
          pageCount={Math.max(1, Math.ceil(menusTotal / pageSize))}
          onPageChange={setPage}
          summary={`Showing ${visibleMenus.length} of ${menusCatalogTotal} menus`}
        />
      ) : null}
    </Box>
  );
}
