'use client';

import Box from '@mui/material/Box';

import {
  compactTouchButtonSx,
  stickyFooterActionsGridSx,
  stickyFooterBackOnlyGridSx,
  stickyFooterShellSx,
} from '@/components/features/floor-and-table-setup/compactLayoutSx';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';

export interface StickyActionFooterProps {
  backLabel?: string;
  onBack: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  showPrimary?: boolean;
  /** Associates the primary button with a form submit (e.g. floor detail save). */
  primaryForm?: string;
  primaryType?: 'button' | 'submit';
}

export function StickyActionFooter({
  backLabel = 'Back',
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
  showPrimary = true,
  primaryForm,
  primaryType = 'button',
}: Readonly<StickyActionFooterProps>) {
  const gridSx =
    showPrimary && primaryLabel ? stickyFooterActionsGridSx : stickyFooterBackOnlyGridSx;

  return (
    <Box component="footer" sx={stickyFooterShellSx}>
      <Box sx={gridSx}>
        <ActionButton
          variant="outlined"
          size="large"
          onClick={onBack}
          sx={{ ...compactTouchButtonSx, gridArea: 'back' }}
        >
          {backLabel}
        </ActionButton>
        {showPrimary && primaryLabel ? (
          <ActionButton
            type={primaryType}
            form={primaryForm}
            size="large"
            disabled={primaryDisabled}
            loading={primaryLoading}
            onClick={primaryType === 'button' ? onPrimary : undefined}
            sx={{ ...compactTouchButtonSx, gridArea: 'primary' }}
          >
            {primaryLabel}
          </ActionButton>
        ) : null}
      </Box>
    </Box>
  );
}
