'use client';

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye, Pencil, Plus, UtensilsCrossed } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

const PAGE_SIZE = 8;

function formatPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

function dietaryVariant(dietary: MenuCatalogItem['dietary']): 'success' | 'danger' | 'default' {
  if (dietary === 'Veg' || dietary === 'Vegan') return 'success';
  if (dietary === 'Non-Veg') return 'danger';
  return 'default';
}

function statusVariant(status: MenuCatalogItem['status']): 'success' | 'warning' | 'default' {
  if (status === 'Available') return 'success';
  if (status === 'Out of Stock') return 'warning';
  return 'default';
}

export interface MenuItemsTableProps {
  items: readonly MenuCatalogItem[];
  onView: (item: MenuCatalogItem) => void;
  onEdit: (item: MenuCatalogItem) => void;
  onAddCategory?: () => void;
  emptyBecauseNoCategories?: boolean;
}

export function MenuItemsTable({
  items,
  onView,
  onEdit,
  onAddCategory,
  emptyBecauseNoCategories = false,
}: Readonly<MenuItemsTableProps>) {
  const [page, setPage] = useState(1);

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
          {formatPrice(row.basePrice)}
        </Typography>
      ),
    },
    {
      field: 'dietary',
      headerName: 'Dietary',
      minWidth: 100,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip label={row.dietary} variantType={dietaryVariant(row.dietary)} size="small" />
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      minWidth: 180,
      sortable: false,
      renderCell: ({ row }) =>
        row.tags.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ) : (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            {row.tags.map((tag) => (
              <StatusChip key={tag} label={tag} variantType="info" size="small" />
            ))}
          </Stack>
        ),
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <StatusChip label={row.status} variantType={statusVariant(row.status)} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      minWidth: 88,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            aria-label={`View ${row.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onView(row);
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
          >
            <Pencil size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (emptyBecauseNoCategories) {
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
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          No categories yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Create a category first, then add menu items under it.
        </Typography>
        {onAddCategory ? (
          <ActionButton startIcon={<Plus size={16} />} onClick={onAddCategory}>
            Add category
          </ActionButton>
        ) : null}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <DataGrid<MenuCatalogItem>
        columns={columns}
        rows={items}
        getRowId={(row) => row.id}
        pagination
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        paginationEntityName="items"
        stickyHeader
        height="100%"
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
    </Box>
  );
}
