'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Card } from '@/components/shared/ui/Card';
import { Loading } from '@/components/shared/ui/Loading';
import { useMenuCreation } from '@/features/menu/context';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

import { menuFeaturePaneInsetSx, menuWorkspaceBottomNavPbSx } from '@/lib/helpers/menu/menuLayout';

import { CreateCategoryForm } from './CreateCategoryForm';
import { CreateMenuItemScreen } from './CreateMenuItemScreen';
import { MenuItemDetailPanel } from './MenuItemDetailPanel';
import { MenuItemsTable } from './MenuItemsTable';
import { MenuManagementToolbar } from './MenuManagementToolbar';
import { MenuSidebar } from './MenuSidebar';

function CategoriesSidebarLoading() {
  return (
    <Card
      component="aside"
      variant="outlined"
      padding={2}
      sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}
    >
      <Loading fullPage={false} size={28} sx={{ minHeight: 200, p: 1 }} />
    </Card>
  );
}

function MenuItemsListBody({
  listKey,
  filteredItems,
  categoriesEmpty,
  canManageCategories,
  isItemsLoading,
  itemsEmpty,
  itemsError,
  onView,
  onEdit,
  onToggleActive,
  togglingItemId,
  statusToggleDisabled,
  onAddCategory,
  page,
  pageSize,
  totalRows,
  onPageChange,
}: Readonly<{
  listKey: string;
  filteredItems: readonly MenuCatalogItem[];
  categoriesEmpty: boolean;
  canManageCategories: boolean;
  isItemsLoading: boolean;
  itemsEmpty: boolean;
  itemsError: Error | null | undefined;
  onView: (item: MenuCatalogItem) => void;
  onEdit: (item: MenuCatalogItem) => void;
  onToggleActive: (item: MenuCatalogItem, nextActive: boolean) => void;
  togglingItemId: string | null;
  statusToggleDisabled: boolean;
  onAddCategory?: () => void;
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}>) {
  if (itemsError) {
    return (
      <AlertMessage
        variant="error"
        title="Unable to load menu items"
        message={
          itemsError instanceof Error ? itemsError.message : 'The menu items request failed.'
        }
      />
    );
  }

  if (isItemsLoading && itemsEmpty) {
    return <Loading fullPage={false} sx={{ minHeight: 200, py: 1 }} />;
  }

  return (
    <MenuItemsTable
      key={listKey}
      items={filteredItems}
      emptyBecauseNoCategories={categoriesEmpty}
      onView={onView}
      onEdit={onEdit}
      onToggleActive={onToggleActive}
      togglingItemId={togglingItemId}
      statusToggleDisabled={statusToggleDisabled}
      onAddCategory={canManageCategories ? onAddCategory : undefined}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      onPageChange={onPageChange}
    />
  );
}

function MenuListPane() {
  const {
    pageConfig,
    categories,
    filteredItems,
    searchQuery,
    setSearchQuery,
    activeCategoryId,
    openCreateCategory,
    openCreateItem,
    openEditItem,
    openViewItem,
    toggleItemStatus,
    isUpdatingItemStatus,
    items,
    isItemsLoading,
    itemsError,
    listPage,
    listPageSize,
    listTotal,
    setListPage,
  } = useMenuCreation();

  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [statusToggleError, setStatusToggleError] = useState<string | null>(null);
  const listKey = `${activeCategoryId ?? 'all'}::${searchQuery.trim().toLowerCase()}`;

  async function handleToggleItemActive(item: MenuCatalogItem, nextActive: boolean) {
    const isActive = item.status === 'Available' || item.status === 'Active';
    if (nextActive === isActive) return;
    setTogglingItemId(item.id);
    setStatusToggleError(null);
    try {
      await toggleItemStatus(item.id, nextActive);
    } catch (error) {
      setStatusToggleError(
        error instanceof Error ? error.message : 'Unable to update item status.',
      );
    } finally {
      setTogglingItemId(null);
    }
  }

  return (
    <Stack
      spacing={2}
      sx={[
        {
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          boxSizing: 'border-box',
        },
        menuFeaturePaneInsetSx,
      ]}
    >
      <MenuManagementToolbar
        pageConfig={pageConfig}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddItem={openCreateItem}
      />

      <Box
        sx={{
          flex: { md: 1 },
          minHeight: { xs: 360, md: 0 },
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minWidth: 0,
        }}
      >
        <MenuItemsListBody
          listKey={listKey}
          filteredItems={filteredItems}
          categoriesEmpty={categories.length === 0}
          canManageCategories={pageConfig.canManageCategories}
          isItemsLoading={Boolean(isItemsLoading)}
          itemsEmpty={items.length === 0}
          itemsError={itemsError}
          onView={openViewItem}
          onEdit={openEditItem}
          onToggleActive={(item, nextActive) => {
            void handleToggleItemActive(item, nextActive);
          }}
          togglingItemId={togglingItemId}
          statusToggleDisabled={Boolean(isUpdatingItemStatus)}
          onAddCategory={openCreateCategory}
          page={listPage}
          pageSize={listPageSize}
          totalRows={listTotal}
          onPageChange={setListPage}
        />
      </Box>

      {statusToggleError ? (
        <AlertMessage
          variant="error"
          title="Unable to update item status"
          message={statusToggleError}
          sx={{ mt: 1 }}
        />
      ) : null}
    </Stack>
  );
}

function MenuMainPane() {
  const {
    viewMode,
    selectedItem,
    items,
    openEditItem,
    backToList,
    addCategory,
    updateCategory,
    editingCategory,
    deleteItem,
    isDeletingItem,
  } = useMenuCreation();

  if (viewMode === 'create-item' || viewMode === 'edit-item') {
    return (
      <Box
        sx={[
          { flex: 1, minHeight: 0, overflow: 'auto' },
          menuFeaturePaneInsetSx,
          menuWorkspaceBottomNavPbSx,
        ]}
      >
        <CreateMenuItemScreen
          mode={viewMode === 'edit-item' ? 'edit' : 'create'}
          initialItem={selectedItem}
          onBack={backToList}
        />
      </Box>
    );
  }

  const viewItem = selectedItem ?? items[0];
  if (viewMode === 'view-item' && viewItem) {
    return (
      <Box
        sx={[
          { flex: 1, minHeight: 0, overflow: 'auto' },
          menuFeaturePaneInsetSx,
          menuWorkspaceBottomNavPbSx,
        ]}
      >
        <MenuItemDetailPanel
          item={viewItem}
          onBack={backToList}
          onEdit={() => openEditItem(viewItem)}
          isDeleting={Boolean(isDeletingItem)}
          onDelete={async () => {
            await deleteItem(viewItem.id);
          }}
        />
      </Box>
    );
  }

  if (viewMode === 'create-category') {
    return (
      <Box
        sx={[
          { flex: 1, minHeight: 0, overflow: 'auto' },
          menuFeaturePaneInsetSx,
          menuWorkspaceBottomNavPbSx,
        ]}
      >
        <CreateCategoryForm
          key="create-category"
          mode="create"
          onCancel={backToList}
          onSubmit={addCategory}
        />
      </Box>
    );
  }

  if (viewMode === 'edit-category') {
    return (
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', ...menuWorkspaceBottomNavPbSx }}>
        <CreateCategoryForm
          key={editingCategory?.id ?? 'edit-category'}
          mode="edit"
          initialCategory={editingCategory}
          onCancel={backToList}
          onSubmit={updateCategory}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        width: '100%',
        overflow: { xs: 'visible', md: 'hidden' },
      }}
    >
      <MenuListPane />
    </Box>
  );
}

/**
 * Dynamically renders the menu-creation main pane based on view mode
 * (list, create category, create/edit item, view item).
 */
export function MenuContent() {
  const { categories, isCategoriesLoading } = useMenuCreation();
  const showCategoryLoading = Boolean(isCategoriesLoading) && categories.length === 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: { xs: 'visible', md: 'hidden' },
        ...menuWorkspaceBottomNavPbSx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          width: '100%',
          flex: { md: 1 },
          minHeight: { md: 0 },
          alignItems: 'stretch',
        }}
      >
        {showCategoryLoading ? <CategoriesSidebarLoading /> : <MenuSidebar />}

        <Stack
          spacing={0}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: { xs: 0, md: 0 },
            height: { md: '100%' },
            overflow: { xs: 'visible', md: 'hidden' },
            display: 'flex',
          }}
        >
          <MenuMainPane />
        </Stack>
      </Box>
    </Box>
  );
}
