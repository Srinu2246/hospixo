'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { UtensilsCrossed } from 'lucide-react';

import { Card } from '@/components/shared/ui/Card';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { TagsGrid } from '@/components/shared/ui/TagsGrid';
import type { AvailabilityItem } from '@/lib/schemas/menu/menuAvailabilitySchema';

import { DietaryMarker } from './ChannelSelector';

export interface AvailabilityStats {
  total: number;
  available: number;
  eightySixCount: number;
  hidden: number;
}

export interface AvailabilityStatsRowProps {
  stats: AvailabilityStats;
}

const STAT_ITEMS = [
  { key: 'total', label: 'TOTAL ITEMS', color: 'primary.main' },
  { key: 'available', label: 'AVAILABLE', color: 'success.main' },
  { key: 'eightySixCount', label: "86'D ITEMS", color: 'error.main' },
  { key: 'hidden', label: 'HIDDEN', color: 'text.disabled' },
] as const;

export function AvailabilityStatsRow({ stats }: Readonly<AvailabilityStatsRowProps>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1.5,
      }}
    >
      {STAT_ITEMS.map((item) => (
        <Card
          key={item.key}
          variant="outlined"
          padding={0}
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: item.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: 'text.secondary',
                fontSize: '0.6875rem',
              }}
            >
              {item.label}
            </Typography>
          </Stack>
          <Typography sx={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.1 }}>
            {stats[item.key]}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}

export interface AvailabilityItemsTableProps {
  items: readonly AvailabilityItem[];
  /** nextActive true = active, false = inactive */
  onToggleMark: (itemId: string, nextActive: boolean) => void | Promise<void>;
  toggleDisabled?: boolean;
  page?: number;
  pageSize?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
}

function visibilityLabel(item: AvailabilityItem): string {
  if (item.visibility === 'hidden' || item.isHidden) return 'Hidden';
  if (item.visibility === 'dine-in') return 'Dine In';
  return 'Online';
}

export function AvailabilityItemsTable({
  items,
  onToggleMark,
  toggleDisabled = false,
  page = 1,
  pageSize = 8,
  totalRows,
  onPageChange,
}: Readonly<AvailabilityItemsTableProps>) {
  const columns: DataGridColumn<AvailabilityItem>[] = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      width: '100%',
      sortable: true,
      renderCell: ({ row }) => {
        const visibility = visibilityLabel(row);
        return (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
            <Box sx={{ mt: 0.35, flexShrink: 0 }}>
              <DietaryMarker dietary={row.dietary} />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, minWidth: 0 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>
                  {row.name}
                </Typography>
                <Box
                  sx={{ minWidth: 0, maxWidth: '100%' }}
                  onMouseDown={(event) => event.stopPropagation()}
                  onClick={(event) => event.stopPropagation()}
                >
                  <TagsGrid
                    tags={row.tags.length > 0 ? row.tags : [row.tag]}
                    maxVisible={1}
                    chipSx={{
                      maxWidth: 88,
                      '& .MuiChip-label': {
                        px: 0.75,
                        fontSize: '0.6875rem',
                      },
                    }}
                  />
                </Box>
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  mt: 0.35,
                  display: 'block',
                  color: visibility === 'Hidden' ? 'text.disabled' : 'primary.main',
                  fontWeight: 500,
                }}
              >
                Visibility: {visibility}
              </Typography>
            </Box>
          </Stack>
        );
      },
    },
    {
      field: 'mark',
      headerName: 'Status',
      width: 168,
      minWidth: 168,
      maxWidth: 168,
      align: 'right',
      headerAlign: 'right',
      sortable: true,
      renderCell: ({ row }) => {
        const isActive = row.isActive ?? row.mark === 'available';
        return (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                minWidth: 72,
                textAlign: 'right',
                color: isActive ? 'success.main' : 'text.secondary',
              }}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Typography>
            <Switch
              checked={isActive}
              disabled={toggleDisabled}
              onChange={(_event, next) => {
                void onToggleMark(row.id, next);
              }}
              color="primary"
              slotProps={{
                input: {
                  'aria-label': `${row.name} ${isActive ? 'active' : 'inactive'}`,
                },
              }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: 'primary.main' },
              }}
            />
          </Stack>
        );
      },
    },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <DataGrid<AvailabilityItem>
        columns={columns}
        rows={items}
        getRowId={(row) => row.id}
        pagination
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        onPageChange={onPageChange}
        paginationEntityName="items"
        stickyHeader
        height="100%"
        rowHeight={72}
        emptyIcon={UtensilsCrossed}
        emptyTitle="No items found"
        emptySubtitle="No items match this search or filter."
        ariaLabel="Menu availability items"
        sx={{
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          height: '100%',
          flex: 1,
          minHeight: 0,
        }}
      />
    </Box>
  );
}
