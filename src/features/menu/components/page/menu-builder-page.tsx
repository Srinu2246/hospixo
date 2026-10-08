'use client';

import Link from 'next/link';
import { Box, Breadcrumbs, Button, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { ChevronRight, Plus } from 'lucide-react';

import type { MenuBuilderPageConfig } from '../../config/menu-builder-page-config';
import {
  RestaurantMenusProvider,
  useRestaurantMenus,
} from '../../context/restaurant-menus-context';
import { CreateRestaurantMenuView } from '../views/create-restaurant-menu-view';
import { RestaurantMenuDetailView } from '../views/restaurant-menu-detail-view';
import { RestaurantMenusTable } from '../table/restaurant-menus-table';

function MenuBuilderPageContent() {
  const {
    pageConfig,
    viewMode,
    statusFilter,
    menuTypeFilter,
    setStatusFilter,
    setMenuTypeFilter,
    openCreateMenuPage,
  } = useRestaurantMenus();

  if (viewMode === 'create-menu' || viewMode === 'edit-menu') {
    return <CreateRestaurantMenuView />;
  }

  if (viewMode === 'view-menu') {
    return <RestaurantMenuDetailView />;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Breadcrumbs
        separator={<ChevronRight size={14} />}
        sx={{ mb: 2, '& .MuiBreadcrumbs-li': { display: 'flex', alignItems: 'center' } }}
        aria-label="Breadcrumb"
      >
        <Typography
          component={Link}
          href={pageConfig.homeHref}
          variant="body2"
          color="text.secondary"
          sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
        >
          Home
        </Typography>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {pageConfig.pageTitle}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
            {pageConfig.pageTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pageConfig.pageSubtitle}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={openCreateMenuPage}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
        >
          Create Menu
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filter by status"
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={menuTypeFilter}
            onChange={(e) => setMenuTypeFilter(e.target.value)}
            aria-label="Filter by menu type"
          >
            <MenuItem value="all">All types</MenuItem>
            <MenuItem value="dine_in">Dine In</MenuItem>
            <MenuItem value="takeaway">Takeaway</MenuItem>
            <MenuItem value="delivery">Delivery</MenuItem>
            <MenuItem value="online">Online</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <RestaurantMenusTable />
    </Box>
  );
}

export function MenuBuilderPage({ pageConfig }: Readonly<{ pageConfig: MenuBuilderPageConfig }>) {
  return (
    <RestaurantMenusProvider pageConfig={pageConfig}>
      <MenuBuilderPageContent />
    </RestaurantMenusProvider>
  );
}
