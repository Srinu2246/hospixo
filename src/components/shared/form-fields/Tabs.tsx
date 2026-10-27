'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface TabItem {
  value: string; // Unique tab key value
  label: string; // Tab display label
  icon?: ReactNode; // Leading icon element
  disabled?: boolean; // Tab disabled state
}

export interface TabsProps {
  tabs: TabItem[]; // List of tab options
  value: string; // Currently active tab value
  onChange: (value: string) => void; // Active tab selection callback
  fullWidth?: boolean; // Distribute tabs across full width (default: true)
  scrollable?: boolean; // Single horizontal row with overflow scroll (mobile wizard/detail)
  showIndicator?: boolean; // Active tab underline (default true)
  sx?: SxProps<Theme>; // Outer container style overrides
}

// Global Tabs component with icon and active underline indicator
export function Tabs({
  tabs,
  value,
  onChange,
  fullWidth = true,
  scrollable = false,
  showIndicator = true,
  sx,
}: Readonly<TabsProps>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: showIndicator ? '1px solid' : 'none',
        borderColor: 'divider',
        width: '100%',
        ...(scrollable
          ? {
              flexWrap: 'nowrap',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }
          : {}),
        ...((sx as object) || {}),
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value;

        return (
          <ButtonBase
            key={tab.value}
            onClick={() => !tab.disabled && onChange(tab.value)}
            disabled={tab.disabled}
            sx={{
              flex: scrollable ? '0 0 auto' : fullWidth ? 1 : 'none',
              py: 1.5,
              px: scrollable ? 1.5 : 2,
              minHeight: scrollable ? 44 : undefined,
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              whiteSpace: scrollable ? 'nowrap' : undefined,
              transition: 'all 0.15s ease',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              opacity: tab.disabled ? 0.5 : 1,
              '&:hover': {
                bgcolor: isActive ? 'transparent' : 'action.hover',
              },
            }}
          >
            {tab.icon ? (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: isActive ? 'primary.main' : 'inherit',
                  transition: 'color 0.15s ease',
                }}
              >
                {tab.icon}
              </Box>
            ) : null}

            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'primary.main' : 'text.primary',
                transition: 'color 0.15s ease',
              }}
            >
              {tab.label}
            </Typography>

            {/* Bottom Active Indicator Bar */}
            {isActive && showIndicator ? (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2.5,
                  bgcolor: 'primary.main',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            ) : null}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
