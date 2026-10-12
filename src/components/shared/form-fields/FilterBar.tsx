'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';

export interface FilterBarItem<T extends string | number = string> {
  id: T; // Unique filter option identifier
  label: string; // Display label text
  count?: number | string; // Optional count badge
  icon?: ReactNode; // Optional leading icon
  disabled?: boolean; // Disabled state flag
}

export interface FilterBarProps<T extends string | number = string> {
  items?: readonly FilterBarItem<T>[]; // Filter items list
  options?: readonly FilterBarItem<T>[]; // Alias for items
  value?: T; // Selected item id
  activeId?: T; // Alias for value
  onChange: (value: T, item: FilterBarItem<T>) => void; // Selection change callback
  variant?: 'segmented' | 'pills'; // 'segmented' (capsule) or 'pills' (default: segmented)
  size?: 'small' | 'medium' | 'large'; // Size preset (default: medium)
  fullWidth?: boolean; // Stretch tabs to 100% width (default: false)
  scrollable?: boolean; // Enable horizontal scroll on overflow (default: true)
  ariaLabel?: string; // Accessible tablist label
  sx?: SxProps<Theme>; // Outer container styling
  itemSx?: SxProps<Theme>; // Tab button styling
}

const SIZE_STYLES = {
  small: {
    minHeight: 32,
    px: 1.5,
    py: 0.5,
    fontSize: '0.8125rem',
    borderRadius: '6px',
    containerRadius: '10px',
  },
  medium: {
    minHeight: 38,
    px: 2,
    py: 0.75,
    fontSize: '0.875rem',
    borderRadius: '8px',
    containerRadius: '12px',
  },
  large: {
    minHeight: 44,
    px: 2.5,
    py: 1,
    fontSize: '0.9375rem',
    borderRadius: '10px',
    containerRadius: '14px',
  },
} as const;

export function FilterBar<T extends string | number = string>({
  items,
  options,
  value,
  activeId,
  onChange,
  variant = 'segmented',
  size = 'medium',
  fullWidth = false,
  scrollable = true,
  ariaLabel = 'Filter options',
  sx,
  itemSx,
}: Readonly<FilterBarProps<T>>) {
  const filterItems = items ?? options ?? [];
  const selectedValue = value ?? activeId ?? filterItems[0]?.id;
  const sizeConfig = SIZE_STYLES[size];

  // Arrow key navigation between filter tabs
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

    const currentIndex = filterItems.findIndex((it) => it.id === selectedValue);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % filterItems.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + filterItems.length) % filterItems.length;
    }

    const nextItem = filterItems[nextIndex];
    if (nextItem && !nextItem.disabled) {
      e.preventDefault();
      onChange(nextItem.id, nextItem);
    }
  };

  const isSegmented = variant === 'segmented';

  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      sx={{
        display: fullWidth ? 'flex' : 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        height: 42, // Fixed height 42px only
        minHeight: 42, // Minimum height 42px
        maxHeight: 42, // Maximum height 42px
        p: isSegmented ? '4px' : 0,
        gap: isSegmented ? '4px' : 1,
        borderRadius: isSegmented ? sizeConfig.containerRadius : undefined,
        bgcolor: isSegmented
          ? (theme) =>
              theme.palette.mode === 'dark' ? 'action.hover' : 'var(--pos-surface-muted, #F4F5F7)'
          : 'transparent',
        border: isSegmented ? '1px solid' : 'none',
        borderColor: 'divider',
        boxSizing: 'border-box',
        overflowX: scrollable ? 'auto' : 'visible',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        ...sx,
      }}
    >
      {filterItems.map((item) => {
        const active = item.id === selectedValue;

        return (
          <ButtonBase
            key={String(item.id)}
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.id, item)}
            sx={{
              flex: fullWidth ? 1 : '0 0 auto',
              height: isSegmented ? 34 : 42, // Fits 42px container height
              minHeight: isSegmented ? 34 : 42, // Minimum height
              maxHeight: isSegmented ? 34 : 42, // Maximum height
              px: sizeConfig.px,
              py: 0,
              fontSize: sizeConfig.fontSize,
              fontWeight: active ? 700 : 600,
              whiteSpace: 'nowrap',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              userSelect: 'none',
              borderRadius: isSegmented ? sizeConfig.borderRadius : '9999px',
              border: isSegmented ? 'none' : '1px solid',
              borderColor: isSegmented ? undefined : active ? 'primary.main' : 'divider',
              bgcolor: isSegmented
                ? active
                  ? 'background.paper'
                  : 'transparent'
                : active
                  ? 'primary.main'
                  : 'background.paper',
              color: isSegmented
                ? active
                  ? 'primary.main'
                  : 'text.secondary'
                : active
                  ? '#ffffff'
                  : 'text.secondary',
              boxShadow:
                isSegmented && active
                  ? (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 1px 3px rgba(0, 0, 0, 0.4)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)'
                  : 'none',
              '&:hover': {
                color: isSegmented
                  ? active
                    ? 'primary.main'
                    : 'text.primary'
                  : active
                    ? '#ffffff'
                    : 'text.primary',
                bgcolor: isSegmented
                  ? active
                    ? 'background.paper'
                    : 'action.hover'
                  : active
                    ? 'primary.dark'
                    : 'action.hover',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: isSegmented ? -1 : 2,
              },
              '&.Mui-disabled': {
                opacity: 0.45,
                cursor: 'not-allowed',
              },
              ...itemSx,
            }}
          >
            {item.icon ? (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                {item.icon}
              </Box>
            ) : null}

            <span>{item.label}</span>

            {item.count !== undefined ? (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 20,
                  height: 20,
                  px: 0.75,
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  bgcolor: active ? 'primary.lighter' : 'action.selected',
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.count}
              </Box>
            ) : null}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export default FilterBar;
