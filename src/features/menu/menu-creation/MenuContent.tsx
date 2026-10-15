'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, Upload } from 'lucide-react';

import {
  CreateCategoryForm,
  CreateMenuItemPlaceholder,
  MenuItemDetailPanel,
  MenuItemsTable,
} from '@/components/features/menu/menu-creation';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { MENU_SESSION_OPTIONS } from '@/lib/mocks/menu/useMenuCreation.mocks';

import { useMenuCreation } from './context';
import { MenuSidebar } from './MenuSidebar';

/**
 * Dynamically renders the menu-creation main pane based on view mode
 * (list, create category, create/edit item, view item).
 */
export function MenuContent() {
  const {
    pageConfig,
    viewMode,
    categories,
    filteredItems,
    searchQuery,
    setSearchQuery,
    sessionFilter,
    setSessionFilter,
    activeCategoryId,
    selectedItem,
    openCreateCategory,
    openCreateItem,
    openEditItem,
    openViewItem,
    backToList,
    addCategory,
  } = useMenuCreation();

  const listKey = `${activeCategoryId ?? 'all'}::${searchQuery.trim().toLowerCase()}::${sessionFilter}`;

  if (viewMode === 'create-item' || viewMode === 'edit-item') {
    return (
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <CreateMenuItemPlaceholder
          mode={viewMode === 'edit-item' ? 'edit' : 'create'}
          item={selectedItem}
          onBack={backToList}
        />
      </Box>
    );
  }

  if (viewMode === 'view-item' && selectedItem) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <MenuItemDetailPanel
          item={selectedItem}
          onBack={backToList}
          onEdit={() => openEditItem(selectedItem)}
        />
      </Box>
    );
  }

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
      <MenuSidebar />

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
        {viewMode === 'create-category' ? (
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <CreateCategoryForm onCancel={backToList} onSubmit={addCategory} />
          </Box>
        ) : (
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
              sx={{
                alignItems: { sm: 'center' },
                flexShrink: 0,
              }}
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

            <MenuItemsTable
              key={listKey}
              items={filteredItems}
              emptyBecauseNoCategories={categories.length === 0}
              onView={openViewItem}
              onEdit={openEditItem}
              onAddCategory={pageConfig.canManageCategories ? openCreateCategory : undefined}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
