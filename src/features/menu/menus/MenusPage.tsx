'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { MenuCard } from '@/components/features/menu/menus/MenuCard';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import {
  MENU_DAY_FILTER_OPTIONS,
  MENU_STATUS_FILTER_OPTIONS,
  MOCK_MENUS,
  type MenuDayFilter,
  type MenuSessionItem,
  type MenuStatusFilter,
} from '@/lib/mocks/menu/useMenus.mocks';
import type { MenuSessionFormValues } from '@/lib/schemas/menu/menus/menuSessionFormSchema';
import { useToastStore } from '@/stores/toastStore';

import { CreateMenuSessionForm } from './CreateMenuSessionForm';

type MenusMode = 'list' | 'create' | 'edit';

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

  return { basePath, mode: 'list' };
}

/**
 * Menus list / create / edit
 * 1. Header + Create Menus
 * 2. Search / status / days filters
 * 3. Menu session card grid
 * 4. Create at …/menu/menus/create
 * 5. Edit at …/menu/menus/:id/edit
 */
export function MenusPage() {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const { basePath, mode, menuId } = parseMenusPath(pathname);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('all');
  const [dayFilter, setDayFilter] = useState<MenuDayFilter>('any');
  const [menus, setMenus] = useState<MenuSessionItem[]>(MOCK_MENUS);
  const [submitting, setSubmitting] = useState(false);

  const editingMenu = useMemo(
    () => (mode === 'edit' && menuId != null ? menus.find((row) => row.id === menuId) : undefined),
    [mode, menuId, menus],
  );

  const visibleMenus = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menus.filter((menu) => {
      if (statusFilter !== 'all' && menu.status !== statusFilter) return false;
      if (dayFilter !== 'any' && !menu.days.includes(dayFilter)) return false;
      if (!query) return true;
      return (
        menu.name.toLowerCase().includes(query) ||
        menu.menuType.toLowerCase().includes(query) ||
        menu.code.toLowerCase().includes(query)
      );
    });
  }, [menus, search, statusFilter, dayFilter]);

  function goToList() {
    router.push(basePath);
  }

  function toggleStatus(target: MenuSessionItem) {
    setMenus((prev) =>
      prev.map((row) =>
        row.id === target.id
          ? {
              ...row,
              status: row.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
  }

  function handleCreate(values: MenuSessionFormValues) {
    setSubmitting(true);
    const nextId = Math.max(0, ...menus.map((row) => row.id)) + 1;
    setMenus((prev) => [
      {
        id: nextId,
        name: values.name,
        code: values.code.toUpperCase(),
        status: 'active',
        menuType: values.menuType.toUpperCase(),
        description: values.description ?? '',
        updatedAt: new Date().toISOString(),
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
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
    setMenus((prev) =>
      prev.map((row) =>
        row.id === menuId
          ? {
              ...row,
              name: values.name,
              code: values.code.toUpperCase(),
              menuType: values.menuType.toUpperCase(),
              description: values.description ?? '',
              updatedAt: new Date().toISOString(),
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

  if (mode === 'edit') {
    if (!editingMenu) {
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
            name: editingMenu.name,
            code: editingMenu.code,
            menuType: editingMenu.menuType,
            description: editingMenu.description,
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
        <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, flexWrap: 'wrap' }}>
          <Dropdown
            options={[...MENU_STATUS_FILTER_OPTIONS]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            prefix="Status:"
            size="medium"
            minWidth={140}
          />
          <Dropdown
            options={[...MENU_DAY_FILTER_OPTIONS]}
            value={dayFilter}
            onChange={(value) => setDayFilter(value)}
            prefix="Days:"
            size="medium"
            minWidth={150}
          />
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        {visibleMenus.length === 0 ? (
          <AlertMessage
            variant="info"
            title="No menus found"
            message={
              search || statusFilter !== 'all' || dayFilter !== 'any'
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
