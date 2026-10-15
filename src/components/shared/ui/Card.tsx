'use client';

import type { ElementType, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export type CardVariant = 'outlined' | 'elevated' | 'flat' | 'interactive';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  children?: ReactNode; // Card body content
  title?: ReactNode; // Optional card header title
  titleFontSize?: number | string; // Card title font size (default: '14px')
  subtitle?: ReactNode; // Optional card header subtitle
  startIcon?: ReactNode; // Optional icon displayed before the title
  action?: ReactNode; // Optional top-right header action (buttons, chips, menus)
  footer?: ReactNode; // Optional card footer element
  headerDivider?: boolean; // Show divider between header and body (default: false)
  footerDivider?: boolean; // Show divider between body and footer (default: false)
  variant?: CardVariant; // Card styling variant (default: 'outlined')
  padding?: number | string; // Inner body padding (default: 3 / 24px)
  headerPadding?: number | string; // Header padding (default: matches padding)
  footerPadding?: number | string; // Footer padding (default: matches padding)
  borderRadius?: number | string; // Border radius (default: '12px')
  component?: ElementType; // Root element/component (default: 'div')
  onClick?: (event: MouseEvent<HTMLDivElement>) => void; // Optional click handler
  sx?: SxProps<Theme>; // Root container style overrides
  headerSx?: SxProps<Theme>; // Header container style overrides
  footerSx?: SxProps<Theme>; // Footer container style overrides
}

export interface CardHeaderProps {
  title?: ReactNode;
  titleFontSize?: number | string;
  subtitle?: ReactNode;
  startIcon?: ReactNode;
  action?: ReactNode;
  padding?: number | string;
  sx?: SxProps<Theme>;
}

export interface CardContentProps {
  children?: ReactNode;
  padding?: number | string;
  sx?: SxProps<Theme>;
}

export interface CardFooterProps {
  children?: ReactNode;
  padding?: number | string;
  sx?: SxProps<Theme>;
}

/**
 * Reusable Card Header sub-component
 */
export function CardHeader({
  title,
  titleFontSize = '14px',
  subtitle,
  startIcon,
  action,
  padding = 3,
  sx,
}: Readonly<CardHeaderProps>) {
  if (!title && !subtitle && !action && !startIcon) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: padding,
        gap: 1.5,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
        {startIcon ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            {startIcon}
          </Box>
        ) : null}

        <Box sx={{ minWidth: 0, flex: 1 }}>
          {typeof title === 'string' ? (
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontSize: titleFontSize,
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.35,
              }}
            >
              {title}
            </Typography>
          ) : (
            title
          )}

          {typeof subtitle === 'string' ? (
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.8125rem',
                color: 'text.secondary',
                mt: 0.25,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )}
        </Box>
      </Box>

      {action ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>{action}</Box>
      ) : null}
    </Box>
  );
}

/**
 * Reusable Card Content sub-component
 */
export function CardContent({ children, padding = 3, sx }: Readonly<CardContentProps>) {
  return (
    <Box
      sx={{
        p: padding,
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Reusable Card Footer sub-component
 */
export function CardFooter({ children, padding = 3, sx }: Readonly<CardFooterProps>) {
  if (!children) return null;

  return (
    <Box
      sx={{
        p: padding,
        pt: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Global reusable Card component for standard layout surfaces.
 * Supports clean theme-aware light/dark styles, multiple variants, compound slots, and custom actions.
 */
export function Card({
  children,
  title,
  titleFontSize = '14px',
  subtitle,
  startIcon,
  action,
  footer,
  headerDivider = false,
  footerDivider = false,
  variant = 'outlined',
  padding = 3,
  headerPadding,
  footerPadding,
  borderRadius = '12px',
  component = 'div',
  onClick,
  sx,
  headerSx,
  footerSx,
  ...props
}: Readonly<CardProps>) {
  const hasHeader = Boolean(title || subtitle || action || startIcon);
  const actualHeaderPadding = headerPadding ?? padding;
  const actualFooterPadding = footerPadding ?? padding;

  return (
    <Paper
      component={component}
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius,
        bgcolor: (theme) => {
          if (variant === 'flat') {
            return theme.palette.mode === 'dark' ? 'action.hover' : 'background.default';
          }
          return theme.palette.background.paper;
        },
        border: '1px solid',
        borderColor: (theme) => {
          if (variant === 'flat') return 'transparent';
          return theme.palette.divider;
        },
        boxShadow: (theme) => {
          if (variant === 'elevated') {
            return theme.palette.mode === 'dark'
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
              : '0 8px 20px -4px rgba(0, 0, 0, 0.08)';
          }
          if (variant === 'interactive') {
            return theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.04)';
          }
          return 'none';
        },
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: onClick || variant === 'interactive' ? 'pointer' : 'default',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        width: '100%',
        ...(variant === 'interactive' && {
          '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: (theme: Theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2)'
                : theme.palette.text.secondary,
            boxShadow: (theme: Theme) =>
              theme.palette.mode === 'dark'
                ? '0 14px 28px -4px rgba(0, 0, 0, 0.7)'
                : '0 10px 24px -4px rgba(0, 0, 0, 0.1)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {/* Optional Card Header */}
      {hasHeader ? (
        <>
          <CardHeader
            title={title}
            titleFontSize={titleFontSize}
            subtitle={subtitle}
            startIcon={startIcon}
            action={action}
            padding={actualHeaderPadding}
            sx={headerSx}
          />
          {headerDivider ? <Divider sx={{ borderColor: 'divider' }} /> : null}
        </>
      ) : null}

      {/* Card Body */}
      {children !== undefined && children !== null ? (
        <CardContent
          padding={hasHeader ? (typeof padding === 'number' ? padding : padding) : padding}
          sx={{
            pt: hasHeader && !headerDivider ? 0 : undefined,
            pb: footer && !footerDivider ? 0 : undefined,
          }}
        >
          {children}
        </CardContent>
      ) : null}

      {/* Optional Card Footer */}
      {footer ? (
        <>
          {footerDivider ? <Divider sx={{ borderColor: 'divider' }} /> : null}
          <CardFooter padding={actualFooterPadding} sx={footerSx}>
            {footer}
          </CardFooter>
        </>
      ) : null}
    </Paper>
  );
}

// Compound component pattern attachment
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
