'use client';

import Box from '@mui/material/Box';
import MuiSkeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';

export type SkeletonLoaderVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

export interface SkeletonLoaderProps {
  /** Bone shape. Defaults to `rounded`. */
  variant?: SkeletonLoaderVariant;
  width?: number | string;
  height?: number | string;
  /** How many bones to render. Defaults to 1. */
  count?: number;
  /** Gap between bones when `count` > 1. Defaults to 1.25. */
  gap?: number;
  /** Stack direction when `count` > 1. Defaults to `column`. */
  direction?: 'row' | 'column';
  animation?: 'pulse' | 'wave' | false;
  /** Wrapper styles (used when `count` > 1, or always when set with a single bone). */
  sx?: SxProps<Theme>;
  /** Styles applied to each bone. */
  itemSx?: SxProps<Theme>;
}

/**
 * App-wide skeleton placeholder. Prefer this over importing MUI `Skeleton` directly.
 */
export function SkeletonLoader({
  variant = 'rounded',
  width,
  height = 24,
  count = 1,
  gap = 1.25,
  direction = 'column',
  animation = 'wave',
  sx,
  itemSx,
}: Readonly<SkeletonLoaderProps>) {
  const bones = Array.from({ length: Math.max(1, count) }, (_, index) => (
    <MuiSkeleton
      key={index}
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={itemSx}
    />
  ));

  if (count <= 1) {
    return (
      <Box
        role="status"
        aria-busy="true"
        aria-label="Loading"
        sx={[{ lineHeight: 0, width: width ?? '100%' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {bones[0]}
      </Box>
    );
  }

  return (
    <Stack
      role="status"
      aria-busy="true"
      aria-label="Loading"
      direction={direction}
      spacing={gap}
      sx={sx}
    >
      {bones}
    </Stack>
  );
}
