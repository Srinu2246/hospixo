'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye, Pencil, Plus, Search } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { floorSetupCatalog } from '@/lib/mocks/floor-and-table-setup/floorSetup.mocks';
import { screen } from '@/lib/theme/mui/breakpoints';
import type {
  CatalogFloor,
  FloorSort,
  FloorStatusFilter,
} from '@/features/management/floor-and-table-setup/types/floorSetup';

const sortOptions = [
  { id: 'recent', label: 'Recently Updated' },
  { id: 'name', label: 'Name' },
  { id: 'tables', label: 'Table count' },
] as const;

const statusOptions = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
] as const;

export function FloorCatalog({
  onCreate,
  onOpen,
}: Readonly<{
  onCreate: () => void;
  onOpen: (floor: CatalogFloor, tab: 'overview' | 'floor') => void;
}>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<FloorSort>('recent');
  const [status, setStatus] = useState<FloorStatusFilter>('all');
  const floors = visibleFloors(query, sort, status);

  return (
    <Stack spacing={2.5} sx={{ flex: 1 }}>
      <Stack
        direction={{ [screen.mobile]: 'column', [screen.desktop]: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { [screen.desktop]: 'center' }, justifyContent: 'space-between' }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            minWidth: 0,
            width: { [screen.mobile]: '100%', [screen.desktop]: 'auto' },
            flex: 1,
          }}
        >
          <Box sx={{ flex: '1.4 1 0', minWidth: 0, maxWidth: { [screen.desktop]: 280 } }}>
            <Input
              id="floor-search"
              fullWidth
              placeholder="Search floors..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              startIcon={<Search size={16} />}
            />
          </Box>
          <Box
            sx={{
              flex: '1.2 1 0',
              minWidth: 0,
              maxWidth: { [screen.desktop]: 230 },
              '& > .MuiFormControl-root': { width: '100%', minWidth: 0 },
            }}
          >
            <Dropdown
              prefix="Sort by:"
              options={sortOptions}
              value={sort}
              onChange={setSort}
              size="small"
              minWidth={0}
              sx={{
                width: '100%',
                '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />
          </Box>
          <Box
            sx={{
              flex: '0.8 1 0',
              minWidth: 0,
              maxWidth: { [screen.desktop]: 140 },
              '& > .MuiFormControl-root': { width: '100%', minWidth: 0 },
            }}
          >
            <Dropdown
              placeholder="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
              size="small"
              minWidth={0}
              sx={{
                width: '100%',
                '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' },
              }}
            />
          </Box>
        </Stack>
        <ActionButton
          startIcon={<Plus size={16} />}
          onClick={onCreate}
          sx={{
            width: { [screen.mobile]: '100%', [screen.desktop]: 'auto' },
            alignSelf: { [screen.desktop]: 'flex-end' },
          }}
        >
          Create Floor
        </ActionButton>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            [screen.mobile]: '1fr',
            [screen.tablet]: '1fr 1fr',
            [screen.wide]: '1fr 1fr 1fr',
          },
          gap: 2,
        }}
      >
        {floors.map((floor) => (
          <Box
            key={floor.id}
            sx={{
              p: 2,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{floor.name}</Typography>
              <StatusChip
                label={floor.active ? 'Active' : 'Inactive'}
                variantType={floor.active ? 'success' : 'default'}
              />
            </Stack>
            <Typography sx={{ color: 'text.secondary', mt: 1, fontSize: '0.875rem' }}>
              {floor.hubTableCount} Tables · {floor.hubSeatCount} Seats
            </Typography>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                {floor.updatedLabel}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <ActionButton
                  variant="icon"
                  size="small"
                  ariaLabel={`View ${floor.name}`}
                  onClick={() => onOpen(floor, 'overview')}
                >
                  <Eye size={15} />
                </ActionButton>
                <ActionButton
                  variant="icon"
                  size="small"
                  ariaLabel={`Edit ${floor.name}`}
                  onClick={() => onOpen(floor, 'floor')}
                >
                  <Pencil size={15} />
                </ActionButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}

function visibleFloors(query: string, sort: FloorSort, status: FloorStatusFilter): CatalogFloor[] {
  const needle = query.trim().toLowerCase();
  const matched = floorSetupCatalog.filter((floor) => {
    if (status === 'active' && !floor.active) return false;
    if (status === 'inactive' && floor.active) return false;
    if (!needle) return true;
    return floor.name.toLowerCase().includes(needle) || floor.code.toLowerCase().includes(needle);
  });
  return [...matched].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name);
    if (sort === 'tables') return right.tableCount - left.tableCount;
    return right.updatedAt - left.updatedAt;
  });
}
