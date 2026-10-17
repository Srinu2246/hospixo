'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

export type DietaryType = 'Veg' | 'Non-Veg' | 'Egg';

export interface DietaryIconProps {
  type: DietaryType;
  size?: number;
  sx?: SxProps<Theme>;
}

/**
 * Standard Indian food safety dietary icons (Veg, Non-Veg, Egg)
 */
export function DietaryIcon({ type, size = 16, sx }: Readonly<DietaryIconProps>) {
  if (type === 'Veg') {
    return (
      <Box
        component="svg"
        viewBox="0 0 20 20"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
          ...sx,
        }}
      >
        <rect
          x="1.5"
          y="1.5"
          width="17"
          height="17"
          rx="3"
          fill="none"
          stroke="#16A34A"
          strokeWidth="2"
        />
        <circle cx="10" cy="10" r="5" fill="#16A34A" />
      </Box>
    );
  }

  if (type === 'Non-Veg') {
    return (
      <Box
        component="svg"
        viewBox="0 0 20 20"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          display: 'inline-block',
          verticalAlign: 'middle',
          ...sx,
        }}
      >
        <rect
          x="1.5"
          y="1.5"
          width="17"
          height="17"
          rx="3"
          fill="none"
          stroke="#DC2626"
          strokeWidth="2"
        />
        <polygon points="10,5 15.5,14.5 4.5,14.5" fill="#DC2626" />
      </Box>
    );
  }

  // Egg
  return (
    <Box
      component="svg"
      viewBox="0 0 20 20"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...sx,
      }}
    >
      <rect
        x="1.5"
        y="1.5"
        width="17"
        height="17"
        rx="3"
        fill="none"
        stroke="#D97706"
        strokeWidth="2"
      />
      <path
        d="M10 4.5 C7.5 4.5 6 7.5 6 11 C6 13.5 7.8 15.5 10 15.5 C12.2 15.5 14 13.5 14 11 C14 7.5 12.5 4.5 10 4.5 Z"
        fill="#D97706"
      />
    </Box>
  );
}
