'use client';

import type { ElementType, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

export interface CardItemSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode; // Card inner content
  component?: ElementType; // Root HTML element or MUI component (default: div)
  height?: number | string; // Card height (default: 52px)
  bgColor?: string; // Background color (default: #F9FAFB)
  borderColor?: string; // Border color (default: #E2E4EC)
  borderRadius?: number | string; // Border radius (default: 8px)
  padding?: number | string; // Inner horizontal padding (default: 14px)
  onClick?: (event: MouseEvent<HTMLDivElement>) => void; // Optional click handler
  sx?: SxProps<Theme>; // Custom MUI style overrides
}

// Reusable card row section with 52px height, 8px radius, and #F9FAFB background
export function CardItemSection({
  children,
  component = 'div',
  height = 52,
  bgColor,
  borderColor,
  borderRadius = '8px',
  padding = '14px',
  onClick,
  sx,
  ...props
}: Readonly<CardItemSectionProps>) {
  return (
    <Box
      component={component}
      onClick={onClick}
      sx={{
        height, // 52px height
        minHeight: height,
        borderRadius, // 8px border radius
        border: '1px solid',
        borderColor: (theme) => borderColor || theme.palette.divider,
        px: padding, // 14px horizontal padding
        py: 0, // Vertical center alignment
        bgcolor: (theme) =>
          bgColor || (theme.palette.mode === 'dark' ? theme.palette.background.paper : '#F9FAFB'),
        display: 'flex', // Flexbox container
        alignItems: 'center', // Vertical center alignment
        justifyContent: 'space-between', // Distribute items across edges
        gap: 1.5, // Inner item gap
        boxSizing: 'border-box', // Include border in sizing calculations
        width: '100%', // Full container width
        cursor: onClick ? 'pointer' : 'default', // Pointer cursor when clickable
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default CardItemSection;
