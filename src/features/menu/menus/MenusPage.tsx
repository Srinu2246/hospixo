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
import {
  branchMenusQueryKey,
  useActiveBranchId,
  useBranchMenus,
} from '@/lib/hooks/menu/menus/useBranchMenus';
import { MENU_STATUS_FILTER_OPTIONS, type MenuStatusFilter } from '@/lib/mocks/menu/useMenus.mocks';
import type { MenuAssignment } from '@/lib/schemas/menu/menus/menuListSchema';
import type { MenuSessionFormValues } from '@/lib/schemas/menu/menus/menuSessionFormSchema';
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

/**
 * Menus list / create / edit
 * List: GET /v1/restaurant/branches/{branch_id}/menus
 */
export function MenusPage() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);
  const branchId = useActiveBranchId();
  const { basePath, mode, menuId } = parseMenusPath(pathname);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('all');
  const [submitting, setSubmitting] = useState(false);

  const listParams = useMemo(
    () => ({
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: 1,
      page_size: 50,
    }),
    [statusFilter],
  );

  const menusQuery = useBranchMenus(listParams, branchId);
  const menus = useMemo(() => menusQuery.data ?? [], [menusQuery.data]);

  const activeMenu = useMemo(
    () =>
      (mode === 'edit' || mode === 'detail') && menuId != null
        ? menus.find((row) => row.id === menuId)
        : undefined,
    [mode, menuId, menus],
  );

  const visibleMenus = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return menus;
    return menus.filter((row) => {
      const { name, code, menu_type: menuType } = row.menu;
      return (
        name.toLowerCase().includes(query) ||
        (code ?? '').toLowerCase().includes(query) ||
        (menuType ?? '').toLowerCase().includes(query)
      );
    });
  }, [menus, search]);

  function goToList() {
    router.push(basePath);
  }

  function patchMenusCache(updater: (rows: MenuAssignment[]) => MenuAssignment[]) {
    queryClient.setQueryData<MenuAssignment[]>(
      branchMenusQueryKey(branchId, listParams),
      (current) => updater(current ?? []),
    );
  }

  function toggleStatus(target: MenuAssignment) {
    const nextStatus = target.status.toLowerCase() === 'active' ? 'inactive' : 'active';
    const now = new Date().toISOString();
    patchMenusCache((prev) =>
      prev.map((row) =>
        row.id === target.id
          ? {
              ...row,
              status: nextStatus,
              updated_at: now,
              menu: { ...row.menu, status: nextStatus, updated_at: now },
            }
          : row,
      ),
    );
  }

  function handleCreate(values: MenuSessionFormValues) {
    setSubmitting(true);
    const nextId = Math.max(0, ...menus.map((row) => row.id)) + 1;
    const nextMenuId = Math.max(0, ...menus.map((row) => row.menu_id)) + 1;
    const now = new Date().toISOString();
    const sample = menus[0];
    patchMenusCache((prev) => [
      {
        id: nextId,
        organization_id: sample?.organization_id,
        company_id: sample?.company_id,
        branch_id: sample?.branch_id ?? branchId,
        menu_id: nextMenuId,
        display_order: 0,
        is_default: false,
        status: 'active',
        menu: {
          id: nextMenuId,
          organization_id: sample?.organization_id,
          company_id: sample?.company_id,
          catalogue_scope: 'branch',
          branch_id: sample?.branch_id ?? branchId,
          name: values.name,
          code: values.code.toUpperCase(),
          description: values.description || null,
          menu_type: values.menuType.toLowerCase(),
          display_order: 0,
          status: 'active',
          branch_assignment_id: null,
          created_at: now,
          updated_at: now,
        },
        created_at: now,
        updated_at: now,
      },
      ...prev,
    ]);
    setSubmitting(false);
    showToast(`Created “${values.name}” session`, 'success');
    goToList();
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
            menuType: (activeMenu.menu.menu_type || 'all').toUpperCase(),
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
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { sm: 'flex-start' },
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
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
          sx={{ flexShrink: 0 }}
        >
          Create Menus
        </ActionButton>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ flexShrink: 0, alignItems: { md: 'center' } }}
      >
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search sessions..."
          showClear
          fullWidth
          width="100%"
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Dropdown
          options={[...MENU_STATUS_FILTER_OPTIONS]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          prefix="Status:"
          size="medium"
          minWidth={140}
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
    </Box>
  );
}
