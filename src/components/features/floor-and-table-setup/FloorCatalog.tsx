'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Building2, Eye, Pencil, Plus, Search } from 'lucide-react';

import {
  compactFilterDropdownSx,
  compactMuiSpacing,
  filterRowGridSx,
  listPageSubtitleSx,
  listPageTitleSx,
} from '@/components/features/floor-and-table-setup/compactLayoutSx';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { Loading } from '@/components/shared/ui/Loading';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type {
  FloorSort,
  FloorStatusFilter,
  FloorSummary,
} from '@/features/management/floor-and-table-setup/types/floorSetup';
import { screen } from '@/lib/theme/mui/breakpoints';

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

const cardHoverSx = {
  transition: 'border-color 0.15s ease',
  '&:hover': { borderColor: 'grey.400' },
} as const;

const dropdownSx = {
  width: '100%',
  height: 44,
  '& .MuiSelect-select': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const;

export function FloorCatalog({
  floors,
  isLoading = false,
  error = null,
  status,
  onStatusChange,
  onCreate,
  onOpen,
}: Readonly<{
  floors: readonly FloorSummary[];
  isLoading?: boolean;
  error?: string | null;
  status: FloorStatusFilter;
  onStatusChange: (status: FloorStatusFilter) => void;
  onCreate: () => void;
  onOpen: (floor: FloorSummary, tab: 'overview' | 'floor') => void;
}>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<FloorSort>('recent');
  const visible = visibleFloors(floors, query, sort);
  const showEmptyCatalog = !isLoading && !error && floors.length === 0 && !query.trim();

  return (
    <Stack spacing={{ xs: compactMuiSpacing.block, md: 2.5 }} sx={{ flex: 1, width: '100%' }}>
      {/* Mobile / tablet: responsive floors list */}
      <Stack
        spacing={compactMuiSpacing.block}
        sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={listPageTitleSx}>Floors List</Typography>
            <Typography sx={listPageSubtitleSx}>Manage Floors and sections tables.</Typography>
          </Box>
          <ActionButton
            startIcon={<Plus size={16} />}
            size="large"
            onClick={onCreate}
            sx={{ flexShrink: 0, minHeight: 44, whiteSpace: 'nowrap' }}
          >
            Create Floor
          </ActionButton>
        </Stack>
        <Input
          id="floor-search-mobile"
          fullWidth
          placeholder="Search floors..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          startIcon={<Search size={16} />}
        />
        <Box sx={filterRowGridSx}>
          <Dropdown
            prefix="Sort by:"
            options={sortOptions}
            value={sort}
            onChange={setSort}
            size="large"
            minWidth={0}
            sx={compactFilterDropdownSx}
          />
          <Dropdown
            placeholder="Status"
            options={statusOptions}
            value={status}
            onChange={onStatusChange}
            size="large"
            minWidth={0}
            sx={compactFilterDropdownSx}
          />
        </Box>
      </Stack>

      {/* Desktop / laptop: original toolbar */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
          <Box sx={{ flex: '1.4 1 0', minWidth: 0, maxWidth: 280 }}>
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
              maxWidth: 230,
              '& > .MuiFormControl-root': { width: '100%', minWidth: 0 },
            }}
          >
            <Dropdown
              prefix="Sort by:"
              options={sortOptions}
              value={sort}
              onChange={setSort}
              size="large"
              minWidth={0}
              sx={dropdownSx}
            />
          </Box>
          <Box
            sx={{
              flex: '0.8 1 0',
              minWidth: 0,
              maxWidth: 140,
              '& > .MuiFormControl-root': { width: '100%', minWidth: 0 },
            }}
          >
            <Dropdown
              placeholder="Status"
              options={statusOptions}
              value={status}
              onChange={onStatusChange}
              size="large"
              minWidth={0}
              sx={dropdownSx}
            />
          </Box>
        </Stack>
        <ActionButton
          startIcon={<Plus size={16} />}
          onClick={onCreate}
          sx={{ alignSelf: 'flex-end' }}
        >
          Create Floor
        </ActionButton>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {isLoading ? <Loading message="Loading floors..." fullPage={false} /> : null}

      {!isLoading && !error && visible.length === 0 ? (
        <>
          {showEmptyCatalog ? (
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <FloorsEmptyState onCreate={onCreate} />
            </Box>
          ) : null}
          <Typography
            sx={{
              color: 'text.secondary',
              py: 6,
              textAlign: 'center',
              display: showEmptyCatalog ? { xs: 'none', md: 'block' } : 'block',
            }}
          >
            No floors match this search.
          </Typography>
        </>
      ) : null}

      {!isLoading && !error && visible.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              [screen.mobile]: '1fr',
              [screen.tablet]: '1fr 1fr',
              [screen.wide]: '1fr 1fr 1fr',
            },
            gap: { xs: compactMuiSpacing.block, md: 2 },
          }}
        >
          {visible.map((floor) => (
            <FloorCard key={floor.id} floor={floor} onOpen={onOpen} />
          ))}
        </Box>
      ) : null}
    </Stack>
  );
}

function FloorCard({
  floor,
  onOpen,
}: Readonly<{
  floor: FloorSummary;
  onOpen: (floor: FloorSummary, tab: 'overview' | 'floor') => void;
}>) {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`Open ${floor.name} floor overview`}
      onClick={() => onOpen(floor, 'overview')}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(floor, 'overview');
        }
      }}
      sx={{
        p: 2,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        ...cardHoverSx,
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
        {floor.code || 'No code'}
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
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          {floor.updatedLabel}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}
        >
          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<Eye size={15} />}
            onClick={() => onOpen(floor, 'overview')}
            sx={{ minHeight: 40, px: 1.5 }}
          >
            View
          </ActionButton>
          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<Pencil size={15} />}
            onClick={() => onOpen(floor, 'floor')}
            sx={{ minHeight: 40, px: 1.5 }}
          >
            Edit
          </ActionButton>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
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
  );
}

function FloorsEmptyState({ onCreate }: Readonly<{ onCreate: () => void }>) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2 }}>
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'rgba(51, 84, 244, 0.12)',
          color: 'primary.main',
        }}
      >
        <Building2 size={32} strokeWidth={1.75} />
      </Box>
      <Typography sx={{ ...listPageTitleSx, fontSize: '1.1rem' }}>No Floors Added Yet</Typography>
      <Typography
        sx={{ color: 'text.secondary', maxWidth: 420, lineHeight: 1.6, fontSize: '0.875rem' }}
      >
        Create floors to organize your service areas, manage dining tables, and streamline order
        workflows for your staff.
      </Typography>
      <ActionButton
        startIcon={<Plus size={16} />}
        size="large"
        onClick={onCreate}
        sx={{ minHeight: 44 }}
      >
        Create Floor
      </ActionButton>
    </Stack>
  );
}

function visibleFloors(
  floors: readonly FloorSummary[],
  query: string,
  sort: FloorSort,
): FloorSummary[] {
  const needle = query.trim().toLowerCase();
  const matched = floors.filter((floor) => !needle || floor.name.toLowerCase().includes(needle));
  return [...matched].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name);
    if (sort === 'tables') return (right.tableCount ?? 0) - (left.tableCount ?? 0);
    return right.updatedAt - left.updatedAt;
  });
}
