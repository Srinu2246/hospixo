'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';

import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';

import { branchOptionsFromDashboardOutlets } from '@/lib/branches-cache';
import { useOptionalDashboardData } from '@/context/dashboard-data';
import { MenuProvider, useMenu } from '../../context/menu-context';
import type { MenuPageConfig } from '../../config/menu-page-config';
import { CategoriesSidebar } from '../sidebar/categories-sidebar';
import { MenuItemsTable } from '../table/menu-items-table';
import { CreateCategoryView } from '../views/create-category-view';
import { CreateMenuItemView } from '../views/create-menu-item-view';
import { ViewItemDetail } from '../views/view-item-detail';
import { DeleteItemModal } from '../modals/delete-item-modal';

function MenuCreationContent() {
  const {
    pageConfig,
    viewMode,
    searchQuery,
    setSearchQuery,
    branchFilterId,
    setBranchFilterId,
    deletingItem,
    editingItem,
    openCreateItemPage,
    closeDeleteModal,
  } = useMenu();

  const dashboardData = useOptionalDashboardData()?.data;
  const branchOptions = useMemo(
    () => branchOptionsFromDashboardOutlets(dashboardData?.outlets),
    [dashboardData?.outlets],
  );

  if (!pageConfig) {
    return null;
  }

  // Full Page Flow: Create Category View
  if (viewMode === 'create-category') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          p: 0,
          width: '100%',
        }}
      >
        <CategoriesSidebar />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <CreateCategoryView />
        </Box>
      </Box>
    );
  }

  // Full Page Flow: Create or Edit Menu Item View
  if (viewMode === 'create-item' || viewMode === 'edit-item') {
    return (
      <Box sx={{ p: 0, width: '100%' }}>
        <CreateMenuItemView key={editingItem?.id ?? 'create'} />
      </Box>
    );
  }

  // Full Page Flow: View Item Detail
  if (viewMode === 'view-item') {
    return (
      <Box sx={{ p: 0, width: '100%' }}>
        <ViewItemDetail />
        <DeleteItemModal item={deletingItem} onClose={closeDeleteModal} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, width: '100%' }}>
      <StickyBreadcrumbBar
        items={[{ label: 'Home', href: pageConfig.homeHref }, { label: pageConfig.pageTitle }]}
      />

      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {pageConfig.pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pageConfig.pageSubtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {pageConfig.scope === 'company' && (
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={branchFilterId ?? ''}
                onChange={(event) =>
                  setBranchFilterId(event.target.value ? event.target.value : null)
                }
                displayEmpty
                startAdornment={
                  <BusinessIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                }
                sx={{ height: 40, borderRadius: '8px', bgcolor: 'background.paper' }}
              >
                <MenuItem value="">All outlets</MenuItem>
                {branchOptions.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreateItemPage}
            sx={{
              height: 40,
              borderRadius: '8px',
              px: 2.5,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Main Layout Grid */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        <CategoriesSidebar />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 360,
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' },
            }}
          />

          <MenuItemsTable />
        </Box>
      </Box>

      <DeleteItemModal item={deletingItem} onClose={closeDeleteModal} />
    </Box>
  );
}

export function MenuCreationPage({ pageConfig }: Readonly<{ pageConfig: MenuPageConfig }>) {
  return (
    <MenuProvider pageConfig={pageConfig}>
      <MenuCreationContent />
    </MenuProvider>
  );
}
