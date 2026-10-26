'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';

export interface CustomTemplateFooterProps {
  isSubmitting: boolean;
  footerTarget: HTMLElement | null;
  onCancel: () => void;
}

export function CustomTemplateFooter({
  isSubmitting,
  footerTarget,
  onCancel,
}: Readonly<CustomTemplateFooterProps>) {
  const stickyFooterContent = (
    <Box
      sx={{
        width: '100%',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
        borderTop: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 -4px 20px rgba(0, 0, 0, 0.5)'
            : '0 -4px 16px rgba(0, 0, 0, 0.05)',
        px: { xs: 2.5, sm: 3 },
        py: 1.75,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <ActionButton
        variant="outlined"
        onClick={onCancel}
        disabled={isSubmitting}
        sx={{
          height: 38,
          px: 2.5,
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Cancel
      </ActionButton>
      <ActionButton
        variant="primary"
        type="submit"
        form="custom-template-form"
        loading={isSubmitting}
        sx={{
          height: 38,
          px: 2.5,
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
        }}
      >
        Save Template
      </ActionButton>
    </Box>
  );

  if (footerTarget) {
    return createPortal(stickyFooterContent, footerTarget);
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 20,
        mt: 'auto',
        pt: 2,
      }}
    >
      {stickyFooterContent}
    </Box>
  );
}
