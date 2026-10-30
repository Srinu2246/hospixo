'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Eye, Pencil, Plus, UtensilsCrossed } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { TablePagination } from '@/components/shared/ui/TablePagination';
import {
  formatMenuItemPrice,
  isMenuCatalogItemActive,
  menuItemDietaryVariant,
} from '@/lib/helpers/menu/menuItemDisplayHelpers';
import { menuCompactListContainerSx } from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

export interface MenuItemsCompactListProps {
  items: readonly MenuCatalogItem[];
  onView: (item: MenuCatalogItem) => void;
  onEdit: (item: MenuCatalogItem) => void;
  onToggleActive?: (item: MenuCatalogItem, nextActive: boolean) => void;
  togglingItemId?: string | null;
  statusToggleDisabled?: boolean;
  onAddCategory?: () => void;
  emptyBecauseNoCategories?: boolean;
  page: number;
  pageSize: number;
  totalRows?: number;
  onPageChange: (page: number) => void;
}

/**
 * Mobile/tablet menu item rows (Figma list) — desktop uses DataGrid in MenuItemsTable.
 */
export function MenuItemsCompactList({
  items,
  onView,
  onEdit,
  onToggleActive,
  togglingItemId = null,
  statusToggleDisabled = false,
  onAddCategory,
  emptyBecauseNoCategories = false,
  page,
  pageSize,
  totalRows,
  onPageChange,
}: Readonly<MenuItemsCompactListProps>) {
  if (emptyBecauseNoCategories) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No categories yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Create a category first, then add menu items under it.
        </Typography>
        {onAddCategory ? (
          <ActionButton startIcon={<Plus size={16} />} onClick={onAddCategory} fullWidth>
            Add category
          </ActionButton>
        ) : null}
      </Box>
    );
  }

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
          No menu items
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add an item to start building this menu.
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
        {items.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.5,
              width: '100%',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ButtonBase
              onClick={() => onView(row)}
              aria-label={`View ${row.name}`}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                p: 1.5,
                pr: 0.5,
                borderRadius: 0,
                justifyContent: 'flex-start',
                textAlign: 'left',
              }}
            >
              <Avatar
                src={row.imageUrl}
                alt=""
                variant="rounded"
                sx={{ width: 48, height: 48, bgcolor: 'action.hover', flexShrink: 0 }}
              >
                {row.name.charAt(0)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                  {row.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                  noWrap
                >
                  {[row.categoryName, row.dietary].filter(Boolean).join(' · ')}
                  {row.code ? ` · ${row.code}` : ''}
                </Typography>
                <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <StatusChip
                    label={row.dietary}
                    variantType={menuItemDietaryVariant(row.dietary)}
                    size="small"
                  />
                </Box>
              </Box>
            </ButtonBase>

            <Stack spacing={0.5} sx={{ alignItems: 'flex-end', flexShrink: 0, py: 1.5, pr: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatMenuItemPrice(row.basePrice)}
              </Typography>
              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                <IconButton
                  size="small"
                  aria-label={`View ${row.name}`}
                  onClick={() => onView(row)}
                >
                  <Eye size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={`Edit ${row.name}`}
                  onClick={() => onEdit(row)}
                  sx={{ color: 'primary.main' }}
                >
                  <Pencil size={16} />
                </IconButton>
                {onToggleActive ? (
                  <Switch
                    size="small"
                    checked={isMenuCatalogItemActive(row.status)}
                    disabled={statusToggleDisabled || togglingItemId === row.id}
                    onChange={(_event, nextActive) => onToggleActive(row, nextActive)}
                    slotProps={{
                      input: {
                        'aria-label': `${row.name} ${isMenuCatalogItemActive(row.status) ? 'active' : 'inactive'}`,
                      },
                    }}
                  />
                ) : null}
              </Stack>
            </Stack>
          </Box>
        ))}
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
