'use client';

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Eye, Pencil, UtensilsCrossed } from 'lucide-react';

import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { TagsGrid } from '@/components/shared/ui/TagsGrid';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';
import { MenuResponsiveTableShell } from '@/components/features/menu/MenuResponsiveTableShell';
import {
  formatMenuItemPrice,
  isMenuCatalogItemActive,
  menuItemDietaryVariant,
  menuItemStatusVariant,
} from '@/lib/helpers/menu/menuItemDisplayHelpers';
import { screen } from '@/lib/theme/mui/breakpoints';

import { MenuItemsCompactList } from './MenuItemsCompactList';

const PAGE_SIZE = 8;

export interface MenuItemsTableProps {
  items: readonly MenuCatalogItem[];
  onView: (item: MenuCatalogItem) => void;
  onEdit: (item: MenuCatalogItem) => void;
  onToggleActive?: (item: MenuCatalogItem, nextActive: boolean) => void;
  togglingItemId?: string | null;
  statusToggleDisabled?: boolean;
  onAddCategory?: () => void;
  emptyBecauseNoCategories?: boolean;
  page?: number;
  pageSize?: number;
  totalRows?: number;
  onPageChange?: (page: number) => void;
}

export function MenuItemsTable({
  items,
  onView,
  onEdit,
  onToggleActive,
  togglingItemId = null,
  statusToggleDisabled = false,
  onAddCategory,
  emptyBecauseNoCategories = false,
  page: pageProp,
  pageSize = PAGE_SIZE,
  totalRows,
  onPageChange,
}: Readonly<MenuItemsTableProps>) {
  const [internalPage, setInternalPage] = useState(1);
  const page = pageProp ?? internalPage;
  const handlePageChange = onPageChange ?? setInternalPage;
  const tableHeight = '100%';

  const columns: DataGridColumn<MenuCatalogItem>[] = [
    {
      field: 'name',
      headerName: 'Item',
      minWidth: 200,
      sortable: true,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Avatar
            src={row.imageUrl}
            alt=""
            variant="rounded"
            sx={{ width: 40, height: 40, bgcolor: 'action.hover', flexShrink: 0 }}
          >
            {row.name.charAt(0)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {row.name}
            </Typography>
            {row.code ? (
              <Typography variant="caption" color="text.secondary">
                {row.code}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      minWidth: 120,
      sortable: true,
    },
    {
      field: 'basePrice',
      headerName: 'Price',
      minWidth: 90,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatMenuItemPrice(row.basePrice)}
        </Typography>
      ),
    },
    {
      field: 'dietary',
      headerName: 'Dietary',
      minWidth: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip
          label={row.dietary}
          variantType={menuItemDietaryVariant(row.dietary)}
          size="small"
        />
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      minWidth: 120,
      width: 148,
      maxWidth: 168,
      sortable: false,
      renderCell: ({ row }) => (
        <Box
          sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <TagsGrid
            tags={row.tags}
            maxVisible={1}
            chipSx={{
              maxWidth: 72,
              '& .MuiChip-label': {
                px: 0.75,
                fontSize: '0.6875rem',
              },
            }}
          />
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 100,
      width: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip
          label={row.status}
          variantType={menuItemStatusVariant(row.status)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 142,
      minWidth: 142,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <IconButton
            size="small"
            aria-label={`View ${row.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onView(row);
            }}
            sx={{
              width: 30,
              height: 30,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
            }}
          >
            <Eye size={16} />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`Edit ${row.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(row);
            }}
            sx={{
              width: 30,
              height: 30,
              color: '#2563EB',
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)' },
            }}
          >
            <Pencil size={16} />
          </IconButton>
          {onToggleActive ? (
            <Switch
              size="small"
              checked={isMenuCatalogItemActive(row.status)}
              disabled={statusToggleDisabled || togglingItemId === row.id}
              onClick={(event) => event.stopPropagation()}
              onChange={(_event, nextActive) => onToggleActive(row, nextActive)}
              slotProps={{
                input: {
                  'aria-label': `${row.name} ${isMenuCatalogItemActive(row.status) ? 'active' : 'inactive'}`,
                },
              }}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'primary.main',
                },
              }}
            />
          ) : null}
        </Stack>
      ),
    },
  ];

  const compactList = (
    <MenuItemsCompactList
      items={items}
      onView={onView}
      onEdit={onEdit}
      onToggleActive={onToggleActive}
      togglingItemId={togglingItemId}
      statusToggleDisabled={statusToggleDisabled}
      onAddCategory={onAddCategory}
      emptyBecauseNoCategories={emptyBecauseNoCategories}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      onPageChange={handlePageChange}
    />
  );

  if (emptyBecauseNoCategories) {
    return (
      <Box sx={{ display: { [screen.mobile]: 'block', [screen.desktop]: 'block' }, width: '100%' }}>
        {compactList}
      </Box>
    );
  }

  return (
    <MenuResponsiveTableShell
      compact={compactList}
      desktop={
        <DataGrid<MenuCatalogItem>
          columns={columns}
          rows={items}
          getRowId={(row) => row.id}
          onRowClick={(row) => onView(row)}
          pagination
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          paginationEntityName="items"
          stickyHeader
          height={tableHeight}
          minWidth="100%"
          rowHeight={64}
          emptyIcon={UtensilsCrossed}
          emptyTitle="No menu items"
          emptySubtitle="Add an item to start building this menu."
          ariaLabel="Menu items"
          sx={{
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
          }}
        />
      }
    />
  );
}
