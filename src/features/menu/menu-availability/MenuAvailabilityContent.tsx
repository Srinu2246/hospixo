'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bell } from 'lucide-react';

import {
  AvailabilityItemsTable,
  AvailabilityStatsRow,
  ChannelSelector,
} from '@/components/features/menu/menu-availability';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { Tabs } from '@/components/shared/form-fields/Tabs';
import { useMenuAvailability } from '@/features/menu/context';
import { FEATURE_FLAGS, useFeatureFlag } from '@/integrations/growthbook';
import {
  menuAvailabilityFilterDropdownsGridSx,
  menuFeaturePaneInsetSx,
  menuWorkspaceBottomNavPbSx,
} from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import {
  AVAILABILITY_DIETARY_OPTIONS,
  AVAILABILITY_GROUP_TABS,
  AVAILABILITY_STATUS_OPTIONS,
  type AvailabilityDietaryFilter,
  type AvailabilityStatusFilter,
} from '@/lib/mocks/menu/useMenuAvailability.mocks';
import type { AvailabilityChannelGroup } from '@/lib/schemas/menu/menuAvailabilitySchema';

import { MenuAvailabilitySidebar } from './MenuAvailabilitySidebar';

export function MenuAvailabilityContent() {
  const {
    pageConfig,
    filteredItems,
    channels,
    stats,
    searchQuery,
    setSearchQuery,
    channelGroup,
    setChannelGroup,
    activeChannelId,
    setActiveChannelId,
    dietaryFilter,
    setDietaryFilter,
    statusFilter,
    setStatusFilter,
    listPage,
    listPageSize,
    listTotal,
    setListPage,
    toggleItemMark,
    isUpdatingItemStatus,
  } = useMenuAvailability();

  const showAllOnlineTabs = useFeatureFlag(FEATURE_FLAGS.branch_menu_availability_allOnlineTabs);

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: { xs: 'visible', md: 'hidden' },
          boxSizing: 'border-box',
        },
        menuFeaturePaneInsetSx,
        menuWorkspaceBottomNavPbSx,
      ]}
    >
      <Stack spacing={2} sx={{ flexShrink: 0, pb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            alignItems: { sm: 'flex-start' },
            justifyContent: 'space-between',
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
              sx={{
                mt: 0.5,
                color: 'text.secondary',
                fontSize: '0.875rem',
                display: {
                  [screen.mobile]: 'none',
                  [screen.tablet]: 'block',
                  [screen.desktop]: 'block',
                },
              }}
            >
              {pageConfig.pageSubtitle}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: '999px',
                bgcolor: 'success.main',
                color: 'success.contrastText',
                opacity: 0.95,
                maxWidth: { xs: 'calc(100% - 48px)', sm: 'none' },
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'common.white',
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }} noWrap>
                {pageConfig.syncLabel}
              </Typography>
            </Box>
            <ActionButton variant="icon" size="small" aria-label="Notifications">
              <Bell size={16} />
            </ActionButton>
          </Stack>
        </Stack>

        {showAllOnlineTabs ? (
          <Stack spacing={1.5}>
            <Tabs
              fullWidth={false}
              scrollable
              tabs={[...AVAILABILITY_GROUP_TABS]}
              value={channelGroup}
              onChange={(value) => setChannelGroup(value as AvailabilityChannelGroup)}
            />

            <ChannelSelector
              channels={channels}
              value={activeChannelId}
              onChange={setActiveChannelId}
            />
          </Stack>
        ) : null}

        <AvailabilityStatsRow stats={stats} />
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'stretch',
          overflow: { xs: 'visible', md: 'hidden' },
        }}
      >
        <MenuAvailabilitySidebar />

        <Stack
          spacing={1.5}
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: { xs: 0, md: 0 },
            height: { md: '100%' },
            overflow: { xs: 'visible', md: 'hidden' },
          }}
        >
          <Stack spacing={1.5} sx={{ flexShrink: 0, width: '100%' }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search items..."
              showClear
              fullWidth
            />
            <Box sx={menuAvailabilityFilterDropdownsGridSx}>
              <Dropdown
                options={[...AVAILABILITY_DIETARY_OPTIONS]}
                value={dietaryFilter}
                onChange={(value) => setDietaryFilter(value as AvailabilityDietaryFilter)}
                minWidth="100%"
                size="medium"
              />
              <Dropdown
                options={[...AVAILABILITY_STATUS_OPTIONS]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as AvailabilityStatusFilter)}
                minWidth="100%"
                size="medium"
              />
            </Box>
          </Stack>

          <Box
            sx={{
              flex: { md: 1 },
              minHeight: { xs: 360, md: 0 },
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <AvailabilityItemsTable
              items={filteredItems}
              toggleDisabled={Boolean(isUpdatingItemStatus)}
              onToggleMark={(itemId, nextActive) => {
                void toggleItemMark(itemId, nextActive);
              }}
              page={listPage}
              pageSize={listPageSize}
              totalRows={listTotal}
              onPageChange={setListPage}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
