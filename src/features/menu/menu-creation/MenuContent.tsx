'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Calendar, Plus, Upload } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Card } from '@/components/shared/ui/Card';
import { SkeletonLoader } from '@/components/shared/ui/SkeletonLoader';
import { useMenuCreation } from '@/features/menu/context';
import { MENU_SESSION_OPTIONS } from '@/lib/mocks/menu/useMenuCreation.mocks';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

import { CreateCategoryForm } from './CreateCategoryForm';
import { CreateMenuItemScreen } from './CreateMenuItemScreen';
import { DeleteMenuItemModal } from './DeleteMenuItemModal';
import { MenuItemDetailPanel } from './MenuItemDetailPanel';
import { MenuItemsTable } from './MenuItemsTable';
import { MenuSidebar } from './MenuSidebar';

function CategoriesSidebarSkeleton() {
  return (
    <Card
      component="aside"
      variant="outlined"
      sx={{
        width: { xs: '100%', md: 240 },
        flexShrink: 0,
        alignSelf: 'stretch',
        height: { md: '100%' },
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
      }}
    >
      <SkeletonLoader variant="text" width={70} height={18} />
      <SkeletonLoader count={5} height={36} sx={{ flex: 1 }} />
      <SkeletonLoader height={36} />
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
  onDelete,
  onAddCategory,
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
  onDelete: (item: MenuCatalogItem) => void;
  onAddCategory?: () => void;
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
    return <SkeletonLoader count={6} height={52} sx={{ py: 1 }} />;
  }

  return (
    <MenuItemsTable
      key={listKey}
      items={filteredItems}
      emptyBecauseNoCategories={categoriesEmpty}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onAddCategory={canManageCategories ? onAddCategory : undefined}
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
    sessionFilter,
    setSessionFilter,
    activeCategoryId,
    openCreateCategory,
    openCreateItem,
    openEditItem,
    openViewItem,
    deleteItem,
    isDeletingItem,
    items,
    isItemsLoading,
    itemsError,
  } = useMenuCreation();

  const router = useRouter();
  const [deleteTargetItem, setDeleteTargetItem] = useState<MenuCatalogItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const listKey = `${activeCategoryId ?? 'all'}::${searchQuery.trim().toLowerCase()}::${sessionFilter}`;

  return (
    <>
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
            {pageConfig.pageTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}
          >
            {pageConfig.pageSubtitle}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', flexShrink: 0 }}>
          <ActionButton
            variant="outlined"
            startIcon={<Calendar size={16} />}
            onClick={() => router.push('/branch-manager/menu/sessions')}
          >
            Sessions
          </ActionButton>
          <ActionButton variant="outlined" startIcon={<Upload size={16} />}>
            Upload CSV
          </ActionButton>
          <ActionButton startIcon={<Plus size={16} />} onClick={openCreateItem}>
            Add Item
          </ActionButton>
        </Stack>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, flexShrink: 0 }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items..."
          showClear
          fullWidth
          width="100%"
          sx={{ flex: 1, maxWidth: { sm: 420 } }}
        />
        <Dropdown
          options={[...MENU_SESSION_OPTIONS]}
          value={sessionFilter}
          onChange={setSessionFilter}
          minWidth={200}
          size="medium"
        />
      </Stack>

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
        onDelete={setDeleteTargetItem}
        onAddCategory={openCreateCategory}
      />

      {deleteError ? (
        <AlertMessage
          variant="error"
          title="Unable to delete menu item"
          message={deleteError}
          sx={{ mt: 1 }}
        />
      ) : null}

      <DeleteMenuItemModal
        open={Boolean(deleteTargetItem)}
        loading={Boolean(isDeletingItem)}
        onClose={() => {
          if (isDeletingItem) return;
          setDeleteTargetItem(null);
          setDeleteError(null);
        }}
        onConfirm={async () => {
          if (!deleteTargetItem) return;
          setDeleteError(null);
          try {
            await deleteItem(deleteTargetItem.id);
            setDeleteTargetItem(null);
          } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'The delete request failed.');
          }
        }}
        item={deleteTargetItem}
      />
    </>
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1, sm: 2 } }}>
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: { xs: 1, sm: 2 } }}>
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
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

  return <MenuListPane />;
}

/**
 * Dynamically renders the menu-creation main pane based on view mode
 * (list, create category, create/edit item, view item).
 */
export function MenuContent() {
  const { categories, isCategoriesLoading } = useMenuCreation();
  const showCategorySkeleton = Boolean(isCategoriesLoading) && categories.length === 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        width: '100%',
        height: '100%',
        minHeight: 0,
        alignItems: 'stretch',
      }}
    >
      {showCategorySkeleton ? <CategoriesSidebarSkeleton /> : <MenuSidebar />}

      <Stack
        spacing={2}
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          height: { md: '100%' },
          overflow: 'hidden',
        }}
      >
        <MenuMainPane />
      </Stack>
    </Box>
  );
}
