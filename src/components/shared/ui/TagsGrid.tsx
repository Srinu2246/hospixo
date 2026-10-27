'use client';

import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { StatusChip, type StatusChipVariant } from '@/components/shared/ui/StatusChip';

export interface TagsGridProps {
  /** List of tag strings to render */
  tags?: readonly string[];
  /** StatusChip variant type (default: 'info') */
  variantType?: StatusChipVariant;
  /** Custom resolver to determine StatusChip variant per tag */
  getTagVariant?: (tag: string, index: number) => StatusChipVariant;
  /** Size of tag chips (default: 'small') */
  size?: 'small' | 'medium';
  /** Gap between tags in spacing units (default: 0.75, which is 6px) */
  gap?: number;
  /** Placeholder rendered when tags is empty (default: '—') */
  emptyText?: ReactNode;
  /** Optional max visible count override (bounds or fixes visible tags) */
  maxVisible?: number;
  /** Custom render function for each individual tag */
  renderTag?: (tag: string, index: number) => ReactNode;
  /** Custom render function for the +N badge */
  renderOverflowBadge?: (count: number, remainingTags: readonly string[]) => ReactNode;
  /** Tooltip placement for the overflow badge (default: 'top') */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  /** Optional header title inside the overflow hover tooltip */
  tooltipHeader?: ReactNode;
  /** Whether to show a dot inside the tag chips (default: false) */
  showDot?: boolean;
  /** Whether to style chips as rounded pills (default: false) */
  pill?: boolean;
  /** Root container sx overrides */
  sx?: SxProps<Theme>;
  /** Tag chip sx overrides */
  chipSx?: SxProps<Theme>;
  /** Overflow badge sx overrides */
  plusChipSx?: SxProps<Theme>;
}

/**
 * Global TagsGrid component.
 * Dynamically fits as many tags as possible into the container's available width.
 * Excess tags are grouped into a +N badge that reveals all remaining tags in a styled tooltip on hover.
 */
export function TagsGrid({
  tags = [],
  variantType = 'info',
  getTagVariant,
  size = 'small',
  gap = 0.75,
  emptyText = '—',
  maxVisible,
  renderTag,
  renderOverflowBadge,
  tooltipPlacement = 'top',
  tooltipHeader,
  showDot = false,
  pill = false,
  sx,
  chipSx,
  plusChipSx,
}: Readonly<TagsGridProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);

  const initialCount =
    typeof maxVisible === 'number' ? Math.min(tags.length, maxVisible) : tags.length;
  const [visibleCount, setVisibleCount] = useState<number>(initialCount);

  const renderTagItem = useCallback(
    (tag: string, index: number) => {
      if (renderTag) {
        return renderTag(tag, index);
      }
      const variant = getTagVariant ? getTagVariant(tag, index) : variantType;
      return (
        <StatusChip
          label={tag}
          variantType={variant}
          size={size}
          showDot={showDot}
          pill={pill}
          sx={{
            maxWidth: 180,
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
            ...chipSx,
          }}
        />
      );
    },
    [renderTag, getTagVariant, variantType, size, showDot, pill, chipSx],
  );

  const recalculate = useCallback(() => {
    if (typeof maxVisible === 'number') {
      setVisibleCount(Math.min(tags.length, maxVisible));
      return;
    }

    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure || tags.length === 0) return;

    const availableWidth = container.clientWidth;
    if (availableWidth <= 0) return;

    const children = Array.from(measure.children) as HTMLElement[];
    const tagElements = children.slice(0, tags.length);
    const badgeElement = children[tags.length];
    const badgeWidth = badgeElement ? badgeElement.offsetWidth : 36;

    // Convert MUI spacing unit to pixels (1 unit = 8px)
    const gapPx = typeof gap === 'number' ? gap * 8 : 6;
    const tagWidths = tagElements.map((el) => el.offsetWidth);

    // If all tags fit without needing a +N badge
    const totalAllWidth = tagWidths.reduce((sum, w, i) => sum + w + (i > 0 ? gapPx : 0), 0);

    if (totalAllWidth <= availableWidth) {
      const finalCount =
        typeof maxVisible === 'number' ? Math.min(tags.length, maxVisible) : tags.length;
      setVisibleCount(finalCount);
      return;
    }

    // Excess tags: find how many fit alongside the +N badge
    let accumulated = 0;
    let count = 0;

    for (let i = 0; i < tagWidths.length; i++) {
      const w = tagWidths[i];
      const itemGap = i > 0 ? gapPx : 0;
      const nextWidth = accumulated + itemGap + w;
      const widthWithBadge = nextWidth + gapPx + badgeWidth;

      if (widthWithBadge <= availableWidth) {
        accumulated = nextWidth;
        count++;
      } else {
        break;
      }
    }

    if (typeof maxVisible === 'number') {
      count = Math.min(count, maxVisible);
    }

    // Always show at least 1 item if tags exist so content is visible
    setVisibleCount(Math.max(1, count));
  }, [tags, gap, maxVisible]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      recalculate();
    });

    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return () => cancelAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      recalculate();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [recalculate]);

  if (!tags || tags.length === 0) {
    if (typeof emptyText === 'string') {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ userSelect: 'none' }}>
          {emptyText}
        </Typography>
      );
    }
    return <>{emptyText}</>;
  }

  const boundedCount = Math.min(Math.max(0, visibleCount), tags.length);
  const visibleTags = tags.slice(0, boundedCount);
  const remainingTags = tags.slice(boundedCount);
  const overflowTooltipTags =
    typeof maxVisible === 'number' && tags.length > maxVisible ? tags : remainingTags;

  const renderBadge = (count: number) => {
    if (renderOverflowBadge) {
      return renderOverflowBadge(count, remainingTags);
    }
    return (
      <Box
        component="span"
        tabIndex={0}
        role="button"
        aria-label={`${count} more tags`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: size === 'medium' ? 28 : 24,
          px: 1,
          minWidth: 28,
          borderRadius: pill ? '9999px' : '6px',
          fontSize: '11px',
          fontWeight: 700,
          lineHeight: 1,
          color: (theme) => (theme.palette.mode === 'dark' ? '#94A3B8' : '#475569'),
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
          cursor: 'pointer',
          userSelect: 'none',
          flexShrink: 0,
          transition: 'all 0.15s ease',
          '&:hover, &:focus-visible': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(51, 84, 244, 0.25)' : '#EFF4FE',
            borderColor: 'primary.main',
            color: 'primary.main',
            outline: 'none',
          },
          ...plusChipSx,
        }}
      >
        +{count}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap,
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        position: 'relative',
        ...sx,
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap,
        }}
      >
        {visibleTags.map((tag, idx) => (
          <Box
            key={`${tag}-${idx}`}
            sx={{ display: 'inline-flex', flexShrink: 1, minWidth: 0, maxWidth: '100%' }}
          >
            {renderTagItem(tag, idx)}
          </Box>
        ))}
      </Box>

      {remainingTags.length > 0 ? (
        <Tooltip
          arrow
          placement={tooltipPlacement}
          describeChild
          enterDelay={200}
          enterTouchDelay={0}
          title={
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 0.5,
                maxWidth: 320,
              }}
            >
              {tooltipHeader ?? (
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                    fontSize: '0.6875rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {overflowTooltipTags.length === tags.length
                    ? `All tags (${tags.length})`
                    : `Remaining tags (${remainingTags.length})`}
                </Typography>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {overflowTooltipTags.map((tag, idx) => (
                  <Box key={`overflow-tip-${tag}-${idx}`} sx={{ display: 'inline-flex' }}>
                    {renderTagItem(tag, idx)}
                  </Box>
                ))}
              </Box>
            </Box>
          }
          slotProps={{
            popper: {
              disablePortal: false,
              sx: { zIndex: 1600 },
            },
            tooltip: {
              sx: {
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 10px 28px rgba(0, 0, 0, 0.5)'
                    : '0 10px 28px rgba(15, 23, 42, 0.12)',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '10px',
                p: 1.25,
                pointerEvents: 'auto',
              },
            },
            arrow: {
              sx: {
                color: 'background.paper',
                '&::before': {
                  border: '1px solid',
                  borderColor: 'divider',
                },
              },
            },
          }}
        >
          <Box
            component="span"
            sx={{ display: 'inline-flex', flexShrink: 0 }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            {renderBadge(remainingTags.length)}
          </Box>
        </Tooltip>
      ) : null}

      <Box
        ref={measureRef}
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: -9999,
          left: -9999,
          visibility: 'hidden',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center',
          gap,
        }}
      >
        {tags.map((tag, idx) => (
          <Box key={`measure-${tag}-${idx}`} sx={{ display: 'inline-flex', flexShrink: 0 }}>
            {renderTagItem(tag, idx)}
          </Box>
        ))}
        <Box sx={{ display: 'inline-flex', flexShrink: 0 }}>
          {renderBadge(tags.length > 1 ? tags.length - 1 : 1)}
        </Box>
      </Box>
    </Box>
  );
}
