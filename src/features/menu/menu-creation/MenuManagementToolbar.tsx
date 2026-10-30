'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, Upload } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import {
  menuActionButtonsGridSx,
  menuFiltersGridSx,
  menuPageHeaderGridSx,
} from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import {
  useActiveBranchId,
  useBranchMenus,
  useRestaurantMenus,
} from '@/lib/hooks/menu/menus/menusHooks';
import type { MenuPageConfig } from '@/lib/schemas/menu/menuCreationSchema';

function menusBasePathFromPathname(pathname: string): string {
  const creationMarker = '/menu/menu-creation';
  const creationIdx = pathname.indexOf(creationMarker);
  if (creationIdx >= 0) {
    return `${pathname.slice(0, creationIdx)}/menu/menus`;
  }
  const menusMarker = '/menu/menus';
  const menusIdx = pathname.indexOf(menusMarker);
  if (menusIdx >= 0) return pathname.slice(0, menusIdx + menusMarker.length);
  return '/branch-manager/menu/menus';
}

export interface MenuManagementToolbarProps {
  pageConfig: MenuPageConfig;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddItem: () => void;
}

/**
 * Menu list header actions and filters (Figma): title, action button grid, search + session menu grid.
 */
export function MenuManagementToolbar({
  pageConfig,
  searchQuery,
  onSearchChange,
  onAddItem,
}: Readonly<MenuManagementToolbarProps>) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const menusBasePath = menusBasePathFromPathname(pathname);
  const branchId = useActiveBranchId();
  const [sessionMenuValue, setSessionMenuValue] = useState<number | ''>('');

  const listParams = { page: 1, page_size: 50, status: 'active' as const };
  const branchMenusQuery = useBranchMenus(listParams, branchId);
  const restaurantMenusQuery = useRestaurantMenus(listParams);

  const sessionMenuOptions = useMemo(() => {
    const rows =
      pageConfig.scope === 'branch'
        ? (branchMenusQuery.data?.items ?? [])
        : (restaurantMenusQuery.data?.items ?? []);
    return rows.map((row) => ({
      id: row.menu.id,
      label: row.menu.name,
    }));
  }, [branchMenusQuery.data?.items, pageConfig.scope, restaurantMenusQuery.data?.items]);

  const sessionMenusLoading =
    pageConfig.scope === 'branch' ? branchMenusQuery.isLoading : restaurantMenusQuery.isLoading;

  function handleSessionMenuChange(value: number | '') {
    setSessionMenuValue(value);
    if (value === '') return;
    router.push(`${menusBasePath}/${value}`);
  }

  return (
    <Stack spacing={1.5} sx={{ flexShrink: 0, width: '100%' }}>
      <Box sx={menuPageHeaderGridSx}>
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
            {pageConfig.pageTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              fontSize: '0.875rem',
            }}
          >
            {pageConfig.pageSubtitle}
          </Typography>
        </Box>

        <ActionButton
          variant="primary"
          startIcon={<Plus size={18} strokeWidth={1.75} />}
          onClick={onAddItem}
          size="small"
          sx={{
            px: { [screen.mobile]: 1.25, [screen.tablet]: 1.5, [screen.desktop]: 2 },
            fontSize: { [screen.mobile]: '0.8125rem', [screen.tablet]: '0.875rem' },
          }}
        >
          Add Item
        </ActionButton>
      </Box>

      <Box
        sx={{
          ...menuActionButtonsGridSx,
          gridTemplateColumns: {
            [screen.mobile]: '1fr',
            [screen.tablet]: '1fr',
            [screen.desktop]: 'repeat(2, auto)',
          },
        }}
      >
        <ActionButton
          variant="outlined"
          startIcon={<Upload size={18} strokeWidth={1.75} />}
          fullWidth
        >
          Upload CSV
        </ActionButton>
        <ActionButton
          variant="primary"
          startIcon={<Plus size={18} strokeWidth={1.75} />}
          onClick={onAddItem}
          fullWidth
          sx={{
            display: {
              [screen.mobile]: 'none',
              [screen.tablet]: 'none',
              [screen.desktop]: 'inline-flex',
            },
          }}
        >
          Add Item
        </ActionButton>
      </Box>

      <Box sx={menuFiltersGridSx}>
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search items..."
          showClear
          fullWidth
        />
        <Dropdown<number | ''>
          options={sessionMenuOptions}
          value={sessionMenuValue}
          onChange={handleSessionMenuChange}
          placeholder="Session Menu"
          disabled={sessionMenusLoading && sessionMenuOptions.length === 0}
          minWidth="100%"
          size="medium"
          sx={{ width: '100%' }}
        />
      </Box>
    </Stack>
  );
}
