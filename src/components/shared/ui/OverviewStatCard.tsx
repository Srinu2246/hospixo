'use client';

import type { ElementType, ReactNode } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

export type OverviewStatAccent = 'info' | 'warning' | 'success' | 'secondary';

export type OverviewStatCardProps = Readonly<{
  label: string;
  value: ReactNode;
  icon: ElementType;
  accent?: OverviewStatAccent;
  selected?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  changePercent?: number | null;
  changeLabel?: string;
  /** Footer line shown in success color (e.g. share of total orders). */
  footerText?: string;
  /** Muted helper copy below the value (finance / operations cards). */
  helperText?: string;
  footerContent?: ReactNode;
  sx?: SxProps<Theme>;
}>;

const accentPaletteKey: Record<OverviewStatAccent, 'info' | 'warning' | 'success' | 'secondary'> = {
  info: 'info',
  warning: 'warning',
  success: 'success',
  secondary: 'secondary',
};

function formatTrendPercent(value: number): string {
  if (value > 0) return `+${value}%`;
  if (value < 0) return `${value}%`;
  return `${value}%`;
}

export function OverviewStatCard({
  label,
  value,
  icon: Icon,
  accent = 'info',
  selected = false,
  clickable = false,
  onClick,
  changePercent,
  changeLabel,
  footerText,
  helperText,
  footerContent,
  sx,
}: OverviewStatCardProps) {
  const paletteKey = accentPaletteKey[accent];

  return (
    <Card
      variant="outlined"
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? selected : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      sx={{
        borderRadius: '0.75rem',
        p: { xs: '1.125rem 1.25rem', sm: '1.25rem 1.5rem' },
        minHeight: 140,
        bgcolor: 'background.paper',
        borderColor: selected ? 'info.main' : 'divider',
        borderWidth: selected ? 2 : 1,
        boxShadow: selected
          ? (theme) =>
              `0 0 0 1px ${theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.25)'}`
          : '0 1px 2px rgb(0 0 0 / 0.04)',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left',
        '&:hover': clickable
          ? {
              borderColor: 'info.main',
              boxShadow: '0 2px 4px rgb(0 0 0 / 0.06)',
            }
          : undefined,
        ...((sx as object) || {}),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: { xs: '1.625rem', sm: '1.75rem' },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'text.primary',
              lineHeight: 1.15,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '0.5rem',
            flexShrink: 0,
            bgcolor: (theme) => {
              const main = theme.palette[paletteKey].main;
              return alpha(main, theme.palette.mode === 'dark' ? 0.2 : 0.12);
            },
            color: `${paletteKey}.main`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} aria-hidden />
        </Box>
      </Box>

      <Box sx={{ mt: 1.25, minHeight: '1.25rem' }}>
        {footerContent ??
          (footerText ? (
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'success.main' }}>
              {footerText}
            </Typography>
          ) : typeof changePercent === 'number' && changePercent !== 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: changePercent >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatTrendPercent(changePercent)}
              </Typography>
              {changeLabel ? (
                <Typography
                  component="span"
                  sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
                >
                  {changeLabel}
                </Typography>
              ) : null}
            </Box>
          ) : changeLabel ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {changeLabel}
            </Typography>
          ) : helperText ? (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.45 }}>
              {helperText}
            </Typography>
          ) : null)}
      </Box>
    </Card>
  );
}
