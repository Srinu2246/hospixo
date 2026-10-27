'use client';

import { useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LayoutGrid, Pencil, Plus, Trash2 } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { FilterChips } from '@/components/shared/form-fields/FilterChips';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Card } from '@/components/shared/ui/Card';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  useAssignMenuCategory,
  useMenuCategoryAssignments,
} from '@/lib/hooks/menu/menus/menusHooks';
import { useMenuCategories } from '@/lib/hooks/menu/useMenuCategories';
import { useMenuItems } from '@/lib/hooks/menu/useMenuItems';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import {
  menuSessionScheduleLabel,
  type MenuSessionAssignedItem,
} from '@/lib/mocks/menu/useMenuSessionDetail.mocks';
import type { MenuAssignment } from '@/lib/schemas/menu/menus/menusSchema';
import type { DietaryTypeApi, MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useToastStore } from '@/stores/toastStore';

import { AssignMenuItemsModal } from './AssignMenuItemsModal';

const PAGE_SIZE = 10;

export interface MenuSessionDetailPageProps {
  menu: MenuAssignment;
  menusBasePath: string;
  onEdit: () => void;
  onToggleStatus: () => void;
}

function toDietaryLabel(value: DietaryTypeApi): MenuSessionAssignedItem['dietary'] {
  if (value === 'non_veg') return 'Non-Veg';
  if (value === 'egg') return 'Egg';
  if (value === 'vegan') return 'Vegan';
  return 'Veg';
}

function orderTypesLabel(item: MenuItemResponse): string {
  const parts: string[] = [];
  if (item.allow_dine_in) parts.push('Dine-in');
  if (item.allow_takeaway) parts.push('Takeaway');
  if (item.allow_delivery) parts.push('Delivery');
  return parts.length > 0 ? parts.join(', ') : '—';
}

function dietaryVariant(
  dietary: MenuSessionAssignedItem['dietary'],
): 'success' | 'danger' | 'default' {
  if (dietary === 'Veg' || dietary === 'Vegan') return 'success';
  if (dietary === 'Non-Veg') return 'danger';
  return 'default';
}

/**
 * Meal session detail: assigned items, category chips, assign modal.
 * 1. Breadcrumbs  2. Title + schedule + Edit / Deactivate
 * 3. Assigned items card (search, chips, grid / empty)  4. Assign modal
 */
export function MenuSessionDetailPage({
  menu,
  menusBasePath,
  onEdit,
  onToggleStatus,
}: Readonly<MenuSessionDetailPageProps>) {
  const showToast = useToastStore((state) => state.show);
  const categoriesQuery = useMenuCategories({ status: 'active', page: 1, page_size: 100 });

  const menuId = menu.menu_id ?? menu.id;
  const assignCategoryMutation = useAssignMenuCategory();
  const assignmentsQuery = useMenuCategoryAssignments(menuId, { page: 1, page_size: 100 });
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 1500);
  const [page, setPage] = useState(1);
  const [assignOpen, setAssignOpen] = useState(false);

  const catalogItemsQuery = useMenuItems({ status: 'active', page: 1, page_size: 100 });
  const assignedItemsQuery = useMenuItems({
    status: 'active',
    page,
    page_size: PAGE_SIZE,
    search: debouncedSearch.trim() || undefined,
    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
  });

  const isActive = menu.status.toLowerCase() === 'active';
  const sessionName = menu.menu.name;
  const schedule = menuSessionScheduleLabel(menu.menu.code, sessionName);

  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data?.items],
  );
  const menuItems = useMemo(
    () => catalogItemsQuery.data?.items ?? [],
    [catalogItemsQuery.data?.items],
  );
  const assignedPageItems = useMemo(
    () => assignedItemsQuery.data?.items ?? [],
    [assignedItemsQuery.data?.items],
  );

  const categoryAssignments = useMemo(
    () => assignmentsQuery.data?.items ?? [],
    [assignmentsQuery.data?.items],
  );

  const assignedCategoryIds = useMemo(
    () => categoryAssignments.map((row) => row.category_id),
    [categoryAssignments],
  );

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    for (const assignment of categoryAssignments) {
      if (assignment.category?.name) {
        map.set(assignment.category_id, assignment.category.name);
      }
    }
    return map;
  }, [categories, categoryAssignments]);

  const catalogItems = useMemo<MenuSessionAssignedItem[]>(() => {
    return menuItems.map((item) => {
      const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
      return {
        id: item.id,
        name: item.name,
        categoryId: item.category_id,
        categoryName: categoryNameById.get(item.category_id) ?? `Category #${item.category_id}`,
        basePrice: item.base_price,
        dietary: toDietaryLabel(item.dietary_type),
        orderTypes: orderTypesLabel(item),
        imageUrl: primaryImage?.url ?? undefined,
      };
    });
  }, [categoryNameById, menuItems]);

  const assignedCategorySet = useMemo(() => new Set(assignedCategoryIds), [assignedCategoryIds]);

  const assignedCatalogItems = useMemo(
    () => catalogItems.filter((item) => assignedCategorySet.has(item.categoryId)),
    [assignedCategorySet, catalogItems],
  );

  const assignedListItems = useMemo<MenuSessionAssignedItem[]>(() => {
    return assignedPageItems
      .filter((item) => assignedCategorySet.has(item.category_id))
      .map((item) => {
        const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
        return {
          id: item.id,
          name: item.name,
          categoryId: item.category_id,
          categoryName: categoryNameById.get(item.category_id) ?? `Category #${item.category_id}`,
          basePrice: item.base_price,
          dietary: toDietaryLabel(item.dietary_type),
          orderTypes: orderTypesLabel(item),
          imageUrl: primaryImage?.url ?? undefined,
        };
      });
  }, [assignedCategorySet, assignedPageItems, categoryNameById]);

  const categoryChips = useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of assignedCatalogItems) {
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    }

    const chips = [
      { id: 'all' as const, label: 'All', count: assignedCatalogItems.length },
      ...assignedCategoryIds.map((categoryId) => ({
        id: categoryId as number | 'all',
        label: categoryNameById.get(categoryId) ?? `Category #${categoryId}`,
        count: counts.get(categoryId) ?? 0,
      })),
    ];
    return chips;
  }, [assignedCategoryIds, assignedCatalogItems, categoryNameById]);

  const filteredAssigned = assignedListItems;
  const assignedItemsTotal = assignedItemsQuery.data?.total ?? filteredAssigned.length;

  const modalCategories = useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of catalogItems) {
      if (assignedCategorySet.has(item.categoryId)) continue;
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    }
    return categories
      .filter((category) => !assignedCategorySet.has(category.id))
      .map((category) => ({
        id: category.id,
        label: category.name,
        count: counts.get(category.id) ?? 0,
      }));
  }, [assignedCategorySet, catalogItems, categories]);

  function handleRemoveItem() {
    showToast('Unassign category API is not wired yet', 'info');
  }

  async function handleAssignCategories(categoryIds: number[]) {
    if (!Number.isFinite(menuId) || menuId <= 0) {
      showToast('Invalid menu session', 'error');
      return;
    }

    const newCategoryIds = categoryIds.filter((id) => !assignedCategorySet.has(id));
    if (newCategoryIds.length === 0) return;

    try {
      let displayOrder = assignedCategoryIds.length;
      for (const categoryId of newCategoryIds) {
        await assignCategoryMutation.mutateAsync({
          menuId,
          categoryId,
          displayOrder,
        });
        displayOrder += 1;
      }
      const itemCount = catalogItems.filter((item) =>
        newCategoryIds.includes(item.categoryId),
      ).length;
      showToast(
        `Assigned ${newCategoryIds.length} ${newCategoryIds.length === 1 ? 'category' : 'categories'} (${itemCount} item${itemCount === 1 ? '' : 's'}) to ${sessionName}`,
        'success',
      );
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  }

  const columns: DataGridColumn<MenuSessionAssignedItem>[] = [
    {
      field: 'image',
      headerName: 'Image',
      width: 72,
      sortable: false,
      renderCell: ({ row }) => (
        <Avatar
          src={row.imageUrl}
          alt=""
          variant="rounded"
          sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}
        >
          {row.name.charAt(0)}
        </Avatar>
      ),
    },
    {
      field: 'name',
      headerName: 'Item name',
      minWidth: 160,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      minWidth: 120,
      sortable: true,
      renderCell: ({ row }) => (
        <StatusChip label={row.categoryName} variantType="info" size="small" pill />
      ),
    },
    {
      field: 'basePrice',
      headerName: 'Base price',
      minWidth: 100,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₹{row.basePrice.toLocaleString('en-IN')}
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
      field: 'orderTypes',
      headerName: 'Order types',
      minWidth: 140,
      sortable: false,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            size="small"
            aria-label={`Edit ${row.name}`}
            onClick={() => showToast('Item edit opens from Menu Creation', 'info')}
            sx={{ color: 'primary.main' }}
          >
            <Pencil size={16} />
          </IconButton>
          <IconButton
            size="small"
            aria-label={`Remove ${row.name}`}
            onClick={handleRemoveItem}
            sx={{ color: 'error.main' }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Breadcrumbs
        items={[
          { label: 'Menu', href: menusBasePath },
          { label: sessionName, active: true },
        ]}
        linkSx={{
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
        }}
        activeSx={{ color: 'primary.main', fontWeight: 600 }}
      />

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
            {sessionName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}
          >
            {schedule}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0 }}>
          <ActionButton variant="outlined" startIcon={<Pencil size={15} />} onClick={onEdit}>
            Edit Session
          </ActionButton>
          <ActionButton
            variant="outlined"
            onClick={onToggleStatus}
            sx={{
              color: isActive ? colors.danger.default : colors.success.default,
              borderColor: isActive ? colors.danger.default : colors.success.default,
              '&:hover': {
                borderColor: isActive ? colors.danger.dark : colors.success.dark,
                bgcolor: isActive ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)',
              },
            }}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </ActionButton>
        </Stack>
      </Stack>

      <Card
        variant="outlined"
        padding={0}
        headerPadding={2.5}
        borderRadius="12px"
        title={
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary' }}>
            Assigned Menu Items
          </Typography>
        }
        action={
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <SearchBar
              value={search}
              onChange={(value: string) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search items..."
              showClear
              width={220}
            />
            <ActionButton startIcon={<Plus size={16} />} onClick={() => setAssignOpen(true)}>
              Assign Menu Items
            </ActionButton>
          </Stack>
        }
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        headerSx={{ flexShrink: 0 }}
      >
        <Box
          sx={{
            px: 2.5,
            pb: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: 1,
            minHeight: 0,
            height: '100%',
          }}
        >
          {assignmentsQuery.isError ? (
            <AlertMessage
              variant="error"
              title="Unable to load category assignments"
              message={getErrorMessage(assignmentsQuery.error)}
            />
          ) : null}

          <FilterChips
            items={categoryChips}
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            ariaLabel="Assigned item categories"
          />

          {assignmentsQuery.isLoading ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={28} />
            </Box>
          ) : assignedCategoryIds.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                px: 2,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'rgba(51, 84, 244, 0.1)',
                  color: 'primary.main',
                }}
              >
                <LayoutGrid size={26} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', color: 'text.primary' }}>
                No Menu Items Assigned
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', maxWidth: 440, lineHeight: 1.5 }}
              >
                This session does not have any menu items yet. Start by assigning items from your
                master menu catalog to open this slot for service.
              </Typography>
              <ActionButton
                startIcon={<Plus size={16} />}
                onClick={() => setAssignOpen(true)}
                sx={{ mt: 0.5 }}
              >
                Assign Menu Items
              </ActionButton>
            </Box>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <DataGrid
                columns={columns}
                rows={filteredAssigned}
                getRowId={(row) => row.id}
                height="100%"
                dense
                loading={assignedItemsQuery.isFetching}
                pagination
                page={page}
                pageSize={PAGE_SIZE}
                totalRows={assignedItemsTotal}
                onPageChange={setPage}
                paginationEntityName="items"
                emptyTitle="No items match"
                emptySubtitle="Try another category or search term."
                ariaLabel="Assigned menu items"
              />
            </Box>
          )}
        </Box>
      </Card>

      <AssignMenuItemsModal
        open={assignOpen}
        sessionName={sessionName}
        categories={modalCategories}
        catalogItems={catalogItems}
        assignedIds={catalogItems
          .filter((item) => assignedCategorySet.has(item.categoryId))
          .map((item) => item.id)}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssignCategories}
        assigning={assignCategoryMutation.isPending}
      />
    </Box>
  );
}
