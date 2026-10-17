'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

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

import { MenuCard } from './MenuCard';

/**
 * Menus list
 * 1. Header + Create Menus
 * 2. Search / status / days filters
 * 3. Menu session card grid
 */
export function MenusPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('all');
  const [dayFilter, setDayFilter] = useState<MenuDayFilter>('any');
  const [menus, setMenus] = useState<MenuSessionItem[]>(MOCK_MENUS);

  const visibleMenus = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menus.filter((menu) => {
      if (statusFilter !== 'all' && menu.status !== statusFilter) return false;
      if (dayFilter !== 'any' && !menu.days.includes(dayFilter)) return false;
      if (!query) return true;
      return menu.name.toLowerCase().includes(query) || menu.menuType.toLowerCase().includes(query);
    });
  }, [menus, search, statusFilter, dayFilter]);

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

        <ActionButton startIcon={<Plus size={16} />} sx={{ flexShrink: 0 }}>
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
