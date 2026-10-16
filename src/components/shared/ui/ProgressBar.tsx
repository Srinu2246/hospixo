'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import { colors } from '@/lib/theme/mui/colors';

export interface ProgressStepItem {
  id?: string | number;
  label: string;
  description?: string;
}

export type ProgressBarVariant = 'stepped' | 'linear';

export interface ProgressBarProps {
  /** Visual variant: 'stepped' for multi-step wizards or 'linear' for percent fill */
  variant?: ProgressBarVariant;

  /** Stepped mode: Array of step definitions */
  steps?: readonly ProgressStepItem[];

  /** Current active step index (0-indexed or 1-indexed, controlled by activeStep) */
  activeStep?: number;

  /** Optional callback when a step indicator is clicked */
  onStepClick?: (stepIndex: number) => void;

  /** Linear mode: value from 0 to 100 */
  value?: number;

  /** Linear mode: height of the progress bar in pixels (default: 8) */
  height?: number | string;

  /** Optional accessible label */
  ariaLabel?: string;

  /** Outer container style overrides */
  sx?: SxProps<Theme>;
}

/**
 * Reusable Global Progress Bar Component
 * Supports both stepped multi-form flows (wizard) and continuous linear progress.
 */
export function ProgressBar({
  variant = 'stepped',
  steps = [],
  activeStep = 0,
  onStepClick,
  value = 0,
  height = 8,
  ariaLabel = 'Progress',
  sx,
}: Readonly<ProgressBarProps>) {
  if (variant === 'linear') {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <Box
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        sx={{
          width: '100%',
          height,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? colors.border.dark : colors.border.light,
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
          ...sx,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${clampedValue}%`,
            bgcolor: colors.primary.default,
            borderRadius: '9999px',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    );
  }

  // Stepped Progress Bar (Wizard Style)
  return (
    <Box
      component="nav"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 580,
        mx: 'auto',
        py: 1,
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          position: 'relative',
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < activeStep;
          const isActive = index === activeStep;
          const isClickable = Boolean(onStepClick && (isCompleted || isActive));

          // Connective line to next step
          const hasNext = index < steps.length - 1;
          const nextIsReached = index < activeStep;

          return (
            <React.Fragment key={step.id || step.label}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2,
                  cursor: isClickable ? 'pointer' : 'default',
                  userSelect: 'none',
                }}
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(index);
                  }
                }}
              >
                {/* Step Circle Badge */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    bgcolor: isCompleted
                      ? colors.success.default
                      : isActive
                        ? colors.primary.default
                        : (theme) =>
                            theme.palette.mode === 'dark'
                              ? colors.surface.darkMuted
                              : colors.surface.default,
                    color: isCompleted || isActive ? colors.white.default : colors.text.disabled,
                    border: '2px solid',
                    borderColor: (theme) =>
                      isCompleted
                        ? colors.success.default
                        : isActive
                          ? colors.primary.default
                          : theme.palette.mode === 'dark'
                            ? theme.palette.divider
                            : colors.border.default,
                    boxShadow: isActive ? `0 0 0 4px ${colors.sidebar.badgeBg}` : 'none',
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon sx={{ fontSize: 18, color: colors.white.default }} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </Box>

                {/* Step Label */}
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: '0.75rem',
                    fontWeight: isActive || isCompleted ? 600 : 500,
                    color: isActive
                      ? colors.primary.default
                      : isCompleted
                        ? 'text.primary'
                        : 'text.secondary',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {step.label}
                </Typography>
              </Box>

              {/* Connecting Progress Line */}
              {hasNext && (
                <Box
                  sx={{
                    flex: 1,
                    height: 2,
                    mx: 1.5,
                    mt: '15px', // Center with 32px circle
                    bgcolor: (theme) =>
                      nextIsReached
                        ? colors.success.default
                        : theme.palette.mode === 'dark'
                          ? theme.palette.divider
                          : colors.border.default,
                    transition: 'background-color 0.3s ease',
                    zIndex: 1,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
