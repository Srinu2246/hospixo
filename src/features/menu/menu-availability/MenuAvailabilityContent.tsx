'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bell, Settings2 } from 'lucide-react';

import {
  AvailabilityFooterBar,
  AvailabilityItemsTable,
  AvailabilityStatsRow,
  ChannelSelector,
} from '@/components/features/menu/menu-availability';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { Tabs } from '@/components/shared/form-fields/Tabs';
import { useMenuAvailability } from '@/features/menu/context';
import {
  ADDON_STATUS_OPTIONS,
  AVAILABILITY_GROUP_TABS,
  STORE_STATUS_OPTIONS,
} from '@/lib/mocks/menu/useMenuAvailability.mocks';
import type { AvailabilityChannelGroup } from '@/lib/schemas/menu/menuAvailabilitySchema';

import { MenuAvailabilitySidebar } from './MenuAvailabilitySidebar';

/** Sticky search toolbar height used so categories + table fill remaining viewport. */
const STICKY_SEARCH_OFFSET = 64;

export function MenuAvailabilityContent() {
  const {
    pageConfig,
    filteredItems,
    channels,
    stats,
    changedCount,
    searchQuery,
    setSearchQuery,
    channelGroup,
    setChannelGroup,
    activeChannelId,
    setActiveChannelId,
    addonStatus,
    setAddonStatus,
    storeStatus,
    setStoreStatus,
    toggleItemMark,
    isUpdatingItemStatus,
    updateAvailability,
  } = useMenuAvailability();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Page scroll region — header scrolls away; search sticks; list fills rest */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            pb: 2,
          }}
        >
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
                sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}
              >
                {pageConfig.pageSubtitle}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
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
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'inherit' }}>
                  {pageConfig.syncLabel}
                </Typography>
              </Box>
              <ActionButton variant="icon" size="small" aria-label="Notifications">
                <Bell size={16} />
              </ActionButton>
            </Stack>
          </Stack>

          <Tabs
            fullWidth={false}
            tabs={[...AVAILABILITY_GROUP_TABS]}
            value={channelGroup}
            onChange={(value) => setChannelGroup(value as AvailabilityChannelGroup)}
          />

          <ChannelSelector
            channels={channels}
            value={activeChannelId}
            onChange={setActiveChannelId}
          />

          <AvailabilityStatsRow stats={stats} />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            alignItems: { sm: 'center' },
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 3,
            py: 1.5,
            minHeight: STICKY_SEARCH_OFFSET,
            boxSizing: 'border-box',
            bgcolor: 'background.default',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search items..."
            showClear
            fullWidth
            width="100%"
            sx={{ flex: 1, maxWidth: { sm: 360 } }}
          />
          <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', flexShrink: 0 }}>
            <ActionButton variant="outlined" startIcon={<Settings2 size={16} />}>
              Quick Section Controller
            </ActionButton>
            <Dropdown
              options={[...ADDON_STATUS_OPTIONS]}
              value={addonStatus}
              onChange={setAddonStatus}
              minWidth={130}
              size="medium"
            />
            <Dropdown
              options={[...STORE_STATUS_OPTIONS]}
              value={storeStatus}
              onChange={setStoreStatus}
              minWidth={130}
              size="medium"
            />
          </Stack>
        </Stack>

        {/* Fills remaining viewport under sticky search; scrolls internally */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            pt: 2,
            pb: 1.5,
            alignItems: 'stretch',
            flexShrink: 0,
            height: `calc(100% - ${STICKY_SEARCH_OFFSET}px)`,
            minHeight: `calc(100% - ${STICKY_SEARCH_OFFSET}px)`,
            overflow: 'hidden',
          }}
        >
          <MenuAvailabilitySidebar />
          <AvailabilityItemsTable
            items={filteredItems}
            toggleDisabled={Boolean(isUpdatingItemStatus)}
            onToggleMark={(itemId, nextActive) => {
              void toggleItemMark(itemId, nextActive);
            }}
          />
        </Box>
      </Box>

      <AvailabilityFooterBar
        changedCount={changedCount}
        eightySixCount={stats.eightySixCount}
        onUpdate={updateAvailability}
      />
    </Box>
  );
}
