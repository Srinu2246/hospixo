'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Check, Info } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';

export interface AvailabilityFooterBarProps {
  changedCount: number;
  eightySixCount: number;
  onUpdate: () => void;
}

export function AvailabilityFooterBar({
  changedCount,
  eightySixCount,
  onUpdate,
}: Readonly<AvailabilityFooterBarProps>) {
  return (
    <Box
      component="footer"
      sx={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 1.5,
        py: 0.75,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        bgcolor: 'background.paper',
        minHeight: 48,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          minWidth: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'inline-flex', flexShrink: 0, color: 'text.secondary' }}>
          <Info size={15} aria-hidden />
        </Box>
        <Typography
          variant="body2"
          noWrap
          sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}
        >
          {changedCount} item{changedCount === 1 ? '' : 's'} changed
          {' · '}
          <Typography
            component="span"
            variant="body2"
            sx={{ color: 'error.main', fontWeight: 700, fontSize: 'inherit' }}
          >
            {eightySixCount} currently 86&apos;d
          </Typography>
        </Typography>
      </Box>

      <ActionButton
        variant="primary"
        size="small"
        startIcon={<Check size={14} />}
        onClick={onUpdate}
        disabled={changedCount === 0}
        fullWidth={false}
        sx={{ flexShrink: 0, width: 'auto', alignSelf: 'center', color: 'white' }}
      >
        Update Availability
      </ActionButton>
    </Box>
  );
}
