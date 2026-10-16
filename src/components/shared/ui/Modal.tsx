'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { ArrowLeft, X } from 'lucide-react';

export interface ModalProps {
  open: boolean; // Controls modal visibility
  onClose: () => void; // Close callback
  onBack?: () => void; // Optional back navigation callback
  title?: ReactNode; // Dialog title
  subtitle?: ReactNode; // Optional subtitle
  showCloseButton?: boolean; // Displays top-right close icon (default: true)
  children: ReactNode; // Modal content elements
  footer?: ReactNode; // Optional footer element
  loading?: boolean; // Blocks dismiss while a request is in flight
  width?: number | string; // Dialog width (default: 660)
  height?: number | string; // Dialog height (default: 868)
  padding?: number | string; // Content padding (default: 24)
  gap?: number | string; // Header/content/footer spacing (default: 20)
  sx?: SxProps<Theme>; // Dialog root style overrides
  paperSx?: SxProps<Theme>; // Dialog paper container overrides
}

// Global modal dialog adhering to the standard 660x868 container specification
export function Modal({
  open,
  onClose,
  onBack,
  title,
  subtitle,
  showCloseButton = true,
  children,
  footer,
  loading = false,
  width = 660,
  height = 868,
  padding = 24,
  gap = 20,
  sx,
  paperSx,
}: Readonly<ModalProps>) {
  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
        onClose();
      }}
      maxWidth={false}
      sx={{
        '& .MuiBackdrop-root': {
          bgcolor: 'rgba(17, 24, 39, 0.45)',
          backdropFilter: 'blur(3px)',
        },
        ...((sx as object) || {}),
      }}
      slotProps={{
        paper: {
          sx: {
            width: '100%',
            maxWidth: width,
            height: { xs: 'auto', sm: height },
            maxHeight: '92vh',
            m: { xs: 2, sm: 3 },
            p: typeof padding === 'number' ? `${padding}px` : padding,
            borderRadius: '16px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: typeof gap === 'number' ? `${gap}px` : gap,
            overflow: 'hidden',
            ...((paperSx as object) || {}),
          },
        },
      }}
    >
      {/* Modal Header */}
      {title || onBack || showCloseButton ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            {onBack ? (
              <ButtonBase
                onClick={onBack}
                aria-label="Go back"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    color: 'text.primary',
                  },
                }}
              >
                <ArrowLeft size={18} />
              </ButtonBase>
            ) : null}

            {typeof title === 'string' ? (
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="h2"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </Typography>
                {subtitle ? (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                  >
                    {subtitle}
                  </Typography>
                ) : null}
              </Box>
            ) : (
              title
            )}
          </Box>

          {showCloseButton ? (
            <ButtonBase
              onClick={onClose}
              disabled={loading}
              aria-label="Close dialog"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: 'action.hover',
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'action.selected',
                  color: 'text.primary',
                },
              }}
            >
              <X size={18} />
            </ButtonBase>
          ) : null}
        </Box>
      ) : null}

      {/* Modal Scrollable Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: typeof gap === 'number' ? `${gap}px` : gap,
          pr: 0.5,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: 'text.secondary',
          },
        }}
      >
        {children}
      </Box>

      {/* Modal Footer */}
      {footer ? <Box sx={{ flexShrink: 0, pt: 1 }}>{footer}</Box> : null}
    </Dialog>
  );
}
