'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { UtensilsCrossed } from 'lucide-react';

import { TablePagination } from '@/components/shared/ui/TablePagination';
import { TagsGrid } from '@/components/shared/ui/TagsGrid';
import { menuCompactListContainerSx } from '@/lib/helpers/menu/menuLayout';
import type { AvailabilityItem } from '@/lib/schemas/menu/menuAvailabilitySchema';

import { DietaryMarker } from './ChannelSelector';

function visibilityLabel(item: AvailabilityItem): string {
  if (item.visibility === 'hidden' || item.isHidden) return 'Hidden';
  if (item.visibility === 'dine-in') return 'Dine In';
  return 'Online';
}

export interface AvailabilityItemsCompactListProps {
  items: readonly AvailabilityItem[];
  onToggleMark: (itemId: string, nextActive: boolean) => void | Promise<void>;
  toggleDisabled?: boolean;
  page: number;
  pageSize: number;
  totalRows?: number;
  onPageChange: (page: number) => void;
}

/** Mobile/tablet availability rows — desktop uses DataGrid in AvailabilityItemsTable. */
export function AvailabilityItemsCompactList({
  items,
  onToggleMark,
  toggleDisabled = false,
  page,
  pageSize,
  totalRows,
  onPageChange,
}: Readonly<AvailabilityItemsCompactListProps>) {
  if (items.length === 0) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, color: 'primary.main' }}>
          <UtensilsCrossed size={32} strokeWidth={1.5} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          No items found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No items match this search or filter.
        </Typography>
      </Box>
    );
  }

  const total = totalRows ?? items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <Box sx={menuCompactListContainerSx}>
      <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
        {items.map((row) => {
          const isActive = row.isActive ?? row.mark === 'available';
          const visibility = visibilityLabel(row);
          return (
            <Box
              key={row.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                p: 1.5,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Box sx={{ mt: 0.35, flexShrink: 0 }}>
                <DietaryMarker dietary={row.dietary} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {row.name}
                </Typography>
                <Box sx={{ mt: 0.5, maxWidth: '100%' }}>
                  <TagsGrid
                    tags={row.tags.length > 0 ? row.tags : [row.tag]}
                    maxVisible={2}
                    chipSx={{
                      maxWidth: 96,
                      '& .MuiChip-label': { px: 0.75, fontSize: '0.6875rem' },
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 0.5,
                    display: 'block',
                    color: visibility === 'Hidden' ? 'text.disabled' : 'primary.main',
                    fontWeight: 500,
                  }}
                >
                  Visibility: {visibility}
                </Typography>
              </Box>

              <Stack spacing={0.25} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
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
                  size="small"
                  slotProps={{
                    input: {
                      'aria-label': `${row.name} ${isActive ? 'active' : 'inactive'}`,
                    },
                  }}
                />
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {total > pageSize ? (
        <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <TablePagination
            page={page}
            pageCount={pageCount}
            onPageChange={onPageChange}
            summary={`Showing ${rangeStart}-${rangeEnd} of ${total} items`}
          />
        </Box>
      ) : null}
    </Box>
  );
}
