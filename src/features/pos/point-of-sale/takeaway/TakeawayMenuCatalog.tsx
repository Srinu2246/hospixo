'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { LayoutGrid, LayoutList } from 'lucide-react';

import { FilterBar, type FilterBarItem } from '@/components/shared/form-fields/FilterBar';
import { FilterChips } from '@/components/shared/form-fields/FilterChips';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { SkeletonLoader } from '@/components/shared/ui/SkeletonLoader';
import { MenuItemCard } from '@/components/shared/restaurant-menu/MenuItemCard';
import { colors } from '@/lib/theme/mui/colors';
import type { CartCustomization, PosMenuItem } from '@/lib/mocks/pos/usePosMenu.mocks';

export interface TakeawayMenuCatalogProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  categoryFilterItems: FilterBarItem<string>[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string;
  groupedSections: readonly [string, PosMenuItem[]][];
  getItemCartQuantity: (menuItemId: string) => number;
  onAddDefault: (item: PosMenuItem) => void;
  onDecrementDefault: (item: PosMenuItem) => void;
  onAddCustomized: (
    item: PosMenuItem,
    customization: CartCustomization,
    quantity: number,
    unitPrice: number,
  ) => void;
  /** Captain mobile/tablet: Figma chips + list (no desktop panel chrome). */
  captainCompact?: boolean;
}

function MenuSectionItems({
  items,
  viewMode,
  getItemCartQuantity,
  onAddDefault,
  onDecrementDefault,
  onAddCustomized,
  captainCompact = false,
}: Readonly<{
  items: PosMenuItem[];
  viewMode: 'list' | 'grid';
  getItemCartQuantity: (menuItemId: string) => number;
  onAddDefault: (item: PosMenuItem) => void;
  onDecrementDefault: (item: PosMenuItem) => void;
  onAddCustomized: TakeawayMenuCatalogProps['onAddCustomized'];
  captainCompact?: boolean;
}>) {
  if (viewMode === 'list') {
    return (
      <Stack spacing={1.5}>
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            viewMode="list"
            captainCompact={captainCompact}
            quantityInCart={getItemCartQuantity(item.id)}
            onAddDefault={() => onAddDefault(item)}
            onDecrementDefault={() => onDecrementDefault(item)}
            onAddCustomized={(customization, qty, unitPrice) =>
              onAddCustomized(item, customization, qty, unitPrice)
            }
          />
        ))}
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          viewMode="grid"
          quantityInCart={getItemCartQuantity(item.id)}
          onAddDefault={() => onAddDefault(item)}
          onDecrementDefault={() => onDecrementDefault(item)}
          onAddCustomized={(customization, qty, unitPrice) =>
            onAddCustomized(item, customization, qty, unitPrice)
          }
        />
      ))}
    </Box>
  );
}

function MenuCatalogBody({
  isLoading,
  groupedSections,
  viewMode,
  getItemCartQuantity,
  onAddDefault,
  onDecrementDefault,
  onAddCustomized,
}: Readonly<{
  isLoading: boolean;
  groupedSections: readonly [string, PosMenuItem[]][];
  viewMode: 'list' | 'grid';
  getItemCartQuantity: (menuItemId: string) => number;
  onAddDefault: (item: PosMenuItem) => void;
  onDecrementDefault: (item: PosMenuItem) => void;
  onAddCustomized: TakeawayMenuCatalogProps['onAddCustomized'];
}>) {
  if (isLoading) {
    return <SkeletonLoader count={6} height={72} sx={{ py: 1 }} />;
  }

  if (groupedSections.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
        <Typography sx={{ fontWeight: 600 }}>No menu items found</Typography>
        <Typography sx={{ fontSize: '0.8125rem' }}>
          Try adjusting your search query or category filter
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {groupedSections.map(([sectionName, items]) => (
        <Box key={sectionName}>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 800,
              color: 'text.secondary',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            {sectionName}
          </Typography>
          <MenuSectionItems
            items={items}
            viewMode={viewMode}
            getItemCartQuantity={getItemCartQuantity}
            onAddDefault={onAddDefault}
            onDecrementDefault={onDecrementDefault}
            onAddCustomized={onAddCustomized}
          />
        </Box>
      ))}
    </Stack>
  );
}

export function TakeawayMenuCatalog({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  categoryFilterItems,
  activeCategory,
  onCategoryChange,
  isLoading,
  isError,
  errorMessage,
  groupedSections,
  getItemCartQuantity,
  onAddDefault,
  onDecrementDefault,
  onAddCustomized,
  captainCompact = false,
}: Readonly<TakeawayMenuCatalogProps>) {
  if (captainCompact) {
    const flatItems = groupedSections.flatMap(([, sectionItems]) => sectionItems);

    return (
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'transparent',
        }}
      >
        <Box sx={{ flexShrink: 0, mb: 1.25 }}>
          <FilterChips
            items={categoryFilterItems.map((item) => ({ id: item.id, label: item.label }))}
            value={activeCategory}
            onChange={(value) => onCategoryChange(value)}
            scrollable
          />
        </Box>
        <Box sx={{ flexShrink: 0, mb: 1.5 }}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search food items, drinks, code..."
            fullWidth
            showClear
            sx={{ height: 44, borderRadius: '12px' }}
          />
        </Box>
        {isError ? (
          <AlertMessage
            variant="error"
            title="Unable to load menu"
            message={errorMessage}
            sx={{ mb: 1.5 }}
          />
        ) : null}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.25,
            pb: 1,
          }}
        >
          {isLoading ? (
            <SkeletonLoader count={5} height={88} />
          ) : (
            <MenuSectionItems
              items={flatItems}
              viewMode="list"
              captainCompact
              getItemCartQuantity={getItemCartQuantity}
              onAddDefault={onAddDefault}
              onDecrementDefault={onDecrementDefault}
              onAddCustomized={onAddCustomized}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          Menu
        </Typography>

        <Box sx={{ flex: 1, minWidth: 220 }}>
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
            placeholder="Search items, ingredients..."
            fullWidth
            showClear
            sx={{ height: 40 }}
          />
        </Box>

        <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
          <IconButton
            size="small"
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
            sx={{
              border: '1px solid',
              borderColor: viewMode === 'list' ? 'primary.main' : 'divider',
              borderRadius: '8px',
              bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
              color: viewMode === 'list' ? colors.white.default : 'text.secondary',
              p: 0.75,
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: viewMode === 'list' ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <LayoutList size={18} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
            sx={{
              border: '1px solid',
              borderColor: viewMode === 'grid' ? 'primary.main' : 'divider',
              borderRadius: '8px',
              bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent',
              color: viewMode === 'grid' ? colors.white.default : 'text.secondary',
              p: 0.75,
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: viewMode === 'grid' ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <LayoutGrid size={18} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ mb: 2.5, flexShrink: 0 }}>
        <FilterBar<string>
          items={categoryFilterItems}
          value={activeCategory}
          onChange={onCategoryChange}
          size="small"
        />
      </Box>

      {isError ? (
        <AlertMessage
          variant="error"
          title="Unable to load menu"
          message={errorMessage}
          sx={{ mb: 2 }}
        />
      ) : null}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pr: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.15) transparent'
              : `${colors.border.default} transparent`,
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : colors.border.default,
            borderRadius: 3,
            '&:hover': {
              background: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : colors.gray.light,
            },
          },
        }}
      >
        <MenuCatalogBody
          isLoading={isLoading}
          groupedSections={groupedSections}
          viewMode={viewMode}
          getItemCartQuantity={getItemCartQuantity}
          onAddDefault={onAddDefault}
          onDecrementDefault={onDecrementDefault}
          onAddCustomized={onAddCustomized}
        />
      </Box>
    </Box>
  );
}
