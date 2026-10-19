'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { ChevronRight } from 'lucide-react';
import { colors } from '@/lib/theme/mui/colors';

export interface BreadcrumbItem {
  label: ReactNode; // Breadcrumb title or text content
  href?: string; // Optional target route for navigation via next/link
  onClick?: (event: MouseEvent<HTMLElement>) => void; // Optional click event handler
  icon?: ReactNode; // Optional leading icon before the label
  active?: boolean; // Explicit active item override (default: last item is active)
  bold?: boolean; // Highlight item with heavy/bold typography (e.g., #RES-2024-0847)
  badge?: ReactNode; // Optional chip or badge rendered directly beside this item
}

export type BreadcrumbsSize = 'small' | 'medium' | 'large';
export type BreadcrumbsVariant = 'default' | 'title';
export type BreadcrumbsDivider = 'dotted' | 'solid' | 'none';

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[]; // Ordered list of breadcrumb items
  separator?: ReactNode; // Custom separator element (defaults to ChevronRight)
  size?: BreadcrumbsSize; // Component scale preset (default: 'medium')
  variant?: BreadcrumbsVariant; // Visual variant: 'default' (classic nav) or 'title' (prominent heading)
  chip?: ReactNode; // Shortcut for a trailing status badge/chip after the active item
  ariaLabel?: string; // Accessible nav label (default: 'breadcrumb')
  divider?: BreadcrumbsDivider | boolean; // Visual bottom divider: 'dotted' | 'solid' | 'none'
  dividerColor?: string; // Optional custom color for divider (defaults to primary blue #3354F4 for dotted)
  borderBottom?: boolean | string; // Direct borderBottom support (e.g. true, 'dotted', '1.5px dotted #3354F4')
  sx?: SxProps<Theme>; // Root navigation container style overrides
  linkSx?: SxProps<Theme>; // Clickable breadcrumb item style overrides
  activeSx?: SxProps<Theme>; // Active/current breadcrumb item style overrides
}

// Preset styling configurations by size
const SIZE_CONFIG = {
  small: {
    fontSize: '0.8125rem', // 13px
    titleFontSize: '1rem', // 16px
    iconSize: 14,
    gap: 1, // 8px
    separatorSize: 14,
  },
  medium: {
    fontSize: '0.85rem', // 15px
    titleFontSize: '1.25rem', // 20px
    iconSize: 16,
    gap: 1.25, // 10px
    separatorSize: 16,
  },
  large: {
    fontSize: '1.0625rem', // 17px
    titleFontSize: '1.5rem', // 24px
    iconSize: 20,
    gap: 1.5, // 12px
    separatorSize: 18,
  },
} as const;

/**
 * Global Breadcrumbs navigation component.
 *
 * Supports both standard navigation paths ("Menu Management > Digital Menu Files")
 * and prominent title-level paths with badges ("Reservations > #RES-2024-0847 [Confirmed]").
 */
export function Breadcrumbs({
  items,
  separator,
  size = 'medium',
  variant = 'default',
  chip,
  ariaLabel = 'breadcrumb',
  divider,
  dividerColor,
  borderBottom,
  sx,
  linkSx,
  activeSx,
}: Readonly<BreadcrumbsProps>) {
  if (!items || items.length === 0) {
    return null;
  }

  const config = SIZE_CONFIG[size];
  const isTitleVariant = variant === 'title';

  const isDotted = borderBottom === 'dotted' || divider === 'dotted';
  const isSolid =
    borderBottom === 'solid' || borderBottom === true || divider === 'solid' || divider === true;

  const resolvedBorderBottom =
    typeof borderBottom === 'string' && borderBottom !== 'dotted' && borderBottom !== 'solid'
      ? borderBottom
      : isSolid
        ? `1px solid ${dividerColor || 'rgba(0, 0, 0, 0.12)'}`
        : isDotted
          ? `1.5px dotted ${dividerColor || colors.primary.default}`
          : undefined;

  // Default separator using Lucide ChevronRight
  const defaultSeparator = (
    <Box
      component="span"
      aria-hidden="true"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
        opacity: 0.65,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <ChevronRight size={config.separatorSize} strokeWidth={2.2} />
    </Box>
  );

  const activeSeparator = separator ?? defaultSeparator;

  return (
    <Box
      component="nav"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        ...(resolvedBorderBottom
          ? {
              borderBottom: resolvedBorderBottom,
            }
          : {}),
        ...((sx as object) || {}),
      }}
    >
      <Box
        component="ol"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          listStyle: 'none',
          m: 0,
          p: 0,
          gap: config.gap,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.active ?? isLast;
          const isBold = item.bold ?? (isTitleVariant && isActive);

          // Typography size depends on whether it is a prominent title crumb or standard crumb
          const resolvedFontSize =
            isTitleVariant && isActive ? config.titleFontSize : config.fontSize;

          // Render item content with optional leading icon
          const content = (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              {item.icon ? (
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    color: 'inherit',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
              ) : null}
              <span>{item.label}</span>
            </Box>
          );

          // Interactive item (Next.js Link or button onClick)
          const isInteractive = !isActive && (Boolean(item.href) || Boolean(item.onClick));

          return (
            <Box
              key={typeof item.label === 'string' ? item.label : `crumb-${index}`}
              component="li"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: config.gap,
              }}
            >
              {isInteractive ? (
                item.href ? (
                  <Typography
                    component={Link}
                    href={item.href}
                    onClick={item.onClick}
                    sx={{
                      fontSize: resolvedFontSize,
                      fontWeight: 600,
                      color: 'text.secondary',
                      textDecoration: 'none',
                      lineHeight: 1.2,
                      cursor: 'pointer',
                      transition: 'color 0.15s ease',
                      '&:hover': {
                        color: colors.primary.default,
                        textDecoration: 'none',
                      },
                      ...((linkSx as object) || {}),
                    }}
                  >
                    {content}
                  </Typography>
                ) : (
                  <Typography
                    component="button"
                    type="button"
                    onClick={item.onClick}
                    sx={{
                      background: 'none',
                      border: 'none',
                      p: 0,
                      m: 0,
                      font: 'inherit',
                      fontSize: resolvedFontSize,
                      fontWeight: 600,
                      color: 'text.secondary',
                      cursor: 'pointer',
                      lineHeight: 1.2,
                      transition: 'color 0.15s ease',
                      '&:hover': {
                        color: colors.primary.default,
                      },
                      ...((linkSx as object) || {}),
                    }}
                  >
                    {content}
                  </Typography>
                )
              ) : (
                <Typography
                  component="span"
                  aria-current={isActive ? 'page' : undefined}
                  sx={{
                    fontSize: resolvedFontSize,
                    fontWeight: isBold ? 800 : isActive ? 600 : 500,
                    color: isActive
                      ? colors.primary.default
                      : isBold
                        ? 'text.primary'
                        : 'text.secondary',
                    letterSpacing: isBold ? '-0.02em' : 'normal',
                    lineHeight: 1.2,
                    ...((activeSx as object) || {}),
                  }}
                >
                  {content}
                </Typography>
              )}

              {/* Item-specific badge (e.g. <StatusChip />) */}
              {item.badge ? (
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  {item.badge}
                </Box>
              ) : null}

              {/* Trailing shortcut chip on the last item */}
              {isLast && chip ? (
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  {chip}
                </Box>
              ) : null}

              {/* Breadcrumb separator between items */}
              {!isLast ? activeSeparator : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
