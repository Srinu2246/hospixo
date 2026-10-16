'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';

export interface FilterChipItem<T extends string | number = string> {
  id: T; // Unique filter option identifier
  label: string; // Display label text
  count?: number | string; // Optional count badge
  icon?: ReactNode; // Optional leading icon
  disabled?: boolean; // Disabled state flag
}

export interface FilterChipsProps<T extends string | number = string> {
  items?: readonly FilterChipItem<T>[]; // Filter chips items list
  options?: readonly FilterChipItem<T>[]; // Alias for items
  value?: T; // Currently selected filter id
  activeId?: T; // Alias for value
  onChange: (value: T, item: FilterChipItem<T>) => void; // Selection change callback
  scrollable?: boolean; // Enable horizontal scroll on overflow (default: true)
  ariaLabel?: string; // Accessible tablist label (default: Filter chips)
  sx?: SxProps<Theme>; // Outer container style overrides
  chipSx?: SxProps<Theme>; // Individual chip button style overrides
}

// Global FilterChips component with height 33px, radius 100px, #183EEB selected & #FFFFFF unselected
export function FilterChips<T extends string | number = string>({
  items,
  options,
  value,
  activeId,
  onChange,
  scrollable = true,
  ariaLabel = 'Filter chips',
  sx,
  chipSx,
}: Readonly<FilterChipsProps<T>>) {
  // Normalize items array and currently selected value
  const filterItems = items ?? options ?? [];
  const selectedValue = value ?? activeId ?? filterItems[0]?.id;

  // Arrow key navigation between filter chips
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

  return (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      sx={{
        display: 'inline-flex', // Inline flex container
        alignItems: 'center', // Center chips vertically
        gap: 1, // 8px spacing between chips
        maxWidth: '100%', // Prevent overflow beyond parent container
        p: 0,
        m: 0,
        overflowX: scrollable ? 'auto' : 'visible', // Horizontal scrolling
        scrollbarWidth: 'none', // Hide standard scrollbar
        '&::-webkit-scrollbar': { display: 'none' }, // Hide webkit scrollbar
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
              height: 33,
              minHeight: 33,
              borderRadius: '100px',
              border: '1px solid',
              borderColor: active ? 'primary.main' : 'divider',
              pt: '8px',
              pr: '20px',
              pb: '8px',
              pl: '20px',
              bgcolor: active ? 'primary.main' : 'background.paper',
              color: active ? '#FFFFFF' : 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: active ? 700 : 500,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              boxSizing: 'border-box',
              userSelect: 'none',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                bgcolor: active ? 'primary.dark' : 'action.hover',
                borderColor: active ? 'primary.dark' : 'text.secondary',
              },
              '&:focus-visible': {
                outline: (theme) => `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
              '&.Mui-disabled': {
                opacity: 0.45,
                cursor: 'not-allowed',
              },
              ...chipSx,
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
                  minWidth: 18,
                  height: 18,
                  px: 0.5,
                  borderRadius: '100px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  bgcolor: active ? 'rgba(255, 255, 255, 0.25)' : 'action.selected',
                  color: active ? '#FFFFFF' : 'text.secondary',
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
