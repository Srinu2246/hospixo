'use client';

import Box from '@mui/material/Box';

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

const touchButtonSx = {
  minHeight: 44,
  width: '100%',
} as const;

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
  const showPrimaryAction = showPrimary && primaryLabel;

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        px: { xs: 2, md: 2.5 },
        py: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gap: 1.25,
          gridTemplateColumns: showPrimaryAction ? '2fr 3fr' : '1fr',
          gridTemplateAreas: showPrimaryAction ? '"back primary"' : '"back"',
          alignItems: 'stretch',
        }}
      >
        <ActionButton
          variant="outlined"
          size="large"
          onClick={onBack}
          sx={{ ...touchButtonSx, gridArea: 'back' }}
        >
          {backLabel}
        </ActionButton>
        {showPrimaryAction ? (
          <ActionButton
            type={primaryType}
            form={primaryForm}
            size="large"
            disabled={primaryDisabled}
            loading={primaryLoading}
            onClick={primaryType === 'button' ? onPrimary : undefined}
            sx={{ ...touchButtonSx, gridArea: 'primary' }}
          >
            {primaryLabel}
          </ActionButton>
        ) : null}
      </Box>
    </Box>
  );
}
