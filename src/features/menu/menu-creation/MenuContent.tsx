'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Calendar, Plus, Upload } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Card } from '@/components/shared/ui/Card';
import { Loading } from '@/components/shared/ui/Loading';
import { useMenuCreation } from '@/features/menu/context';
import type { MenuCatalogItem } from '@/lib/schemas/menu/menuCreationSchema';

import { screen } from '@/lib/theme/mui/breakpoints';

import { CreateCategoryForm } from './CreateCategoryForm';
import { CreateMenuItemScreen } from './CreateMenuItemScreen';
import { MenuItemDetailPanel } from './MenuItemDetailPanel';
import { MenuItemsTable } from './MenuItemsTable';
import { MenuSidebar } from './MenuSidebar';

function menuSessionsHrefFromPathname(pathname: string): string {
  const creationMarker = '/menu/menu-creation';
  const creationIdx = pathname.indexOf(creationMarker);
  if (creationIdx >= 0) {
    return `${pathname.slice(0, creationIdx)}/menu/sessions`;
  }
  const sessionsMarker = '/menu/sessions';
  const sessionsIdx = pathname.indexOf(sessionsMarker);
  if (sessionsIdx >= 0) return pathname.slice(0, sessionsIdx + sessionsMarker.length);
  return '/branch-manager/menu/sessions';
}

function CategoriesSidebarLoading() {
  return (
    <Card
      component="aside"
      variant="outlined"
      sx={{
        width: { xs: '100%', md: 240 },
        flexShrink: 0,
        alignSelf: 'stretch',
        height: { md: '100%' },
        maxHeight: { xs: 240, sm: 280, md: 'none' },
        display: 'flex',
        flexDirection: 'column',
        '& > .MuiBox-root': {
          p: { [screen.mobile]: 1.5, [screen.tablet]: 1.5, [screen.desktop]: 3 },
        },
      }}
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

  const router = useRouter();
  const pathname = usePathname() ?? '';
  const sessionsHref = menuSessionsHrefFromPathname(pathname);
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
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        pl: { xs: 1, sm: 2 },
        pt: { xs: 1, sm: 2 },
        pr: { xs: 1, sm: 2 },
        boxSizing: 'border-box',
      }}
    >
      <Stack spacing={1.5} sx={{ flexShrink: 0, alignItems: 'flex-start', width: '100%' }}>
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

        <Stack
          direction="row"
          spacing={1.25}
          useFlexGap
          sx={{ flexWrap: 'wrap', alignItems: 'center' }}
        >
          <ActionButton
            variant="outlined"
            startIcon={<Calendar size={18} strokeWidth={1.75} />}
            onClick={() => router.push(sessionsHref)}
          >
            Sessions
          </ActionButton>
          <ActionButton variant="outlined" startIcon={<Upload size={18} strokeWidth={1.75} />}>
            Upload CSV
          </ActionButton>
          <ActionButton
            variant="primary"
            startIcon={<Plus size={18} strokeWidth={1.75} />}
            onClick={openCreateItem}
          >
            Add Item
          </ActionButton>
        </Stack>
      </Stack>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search items..."
        showClear
        fullWidth
        sx={{
          flexShrink: 0,
          width: '100%',
          maxWidth: 300,
        }}
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
