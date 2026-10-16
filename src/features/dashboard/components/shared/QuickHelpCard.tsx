'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { ACCOUNT_MANAGER } from '@/lib/mocks/dashboard/dashboard.mocks';

export interface QuickHelpCardProps {
  idLabel?: string;
  showPocBadge?: boolean;
  statusText?: string;
  description?: string;
  availableHours?: string;
  compact?: boolean;
}

export function QuickHelpCard({
  idLabel = 'Outlet ID: 63284',
  showPocBadge = true,
  statusText = 'Online',
  description,
  availableHours,
  compact,
}: Readonly<QuickHelpCardProps>) {
  const cardDescription =
    description ??
    'Your dedicated account manager for all operational support and billing queries. Reach out anytime during working hours.';
  const rawHours = availableHours ?? `Available ${ACCOUNT_MANAGER.availableHours}`;
  const displayHours = rawHours.replace(/^Available\s*/i, '');

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${ACCOUNT_MANAGER.phoneWhatsapp.replace('+', '')}`, '_blank');
  };

  const parsedLabel = idLabel.includes(':') ? idLabel.split(':')[0] + ':' : 'Outlet ID:';
  const parsedIdValue = idLabel.includes(':') ? idLabel.split(':')[1].trim() : idLabel;

  const isAlwaysCompact = compact === true;
  const isNeverCompact = compact === false;

  return (
    <Card
      variant="outlined"
      padding={2.5}
      sx={{
        borderRadius: '14px',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0'),
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: isAlwaysCompact ? 2 : { xs: 2, sm: 2, md: 3 },
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header: Quick Help & Outlet ID Badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.015em',
            }}
          >
            Quick Help
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '0.7125rem',
              color: '#64748B',
              fontWeight: 500,
            }}
          >
            {parsedLabel}
          </Typography>
          <Box
            sx={{
              px: 1.25,
              py: 0.4,
              borderRadius: '8px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              color: 'text.primary',
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {parsedIdValue}
          </Box>
        </Box>
      </Box>

      {/* 2. Account Manager Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
        <Avatar
          src="/images/kumar_reddy.jpg"
          alt="Kumar Reddy"
          sx={{ width: 44, height: 44, borderRadius: '50%' }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, my: 1 }}>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
            }}
          >
            Kumar Reddy
          </Typography>

          {showPocBadge && (
            <Typography
              sx={{
                color: '#64748B',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                my: 1.25,
              }}
            >
              POINT OF CONTACT (POC)
            </Typography>
          )}
        </Box>
      </Box>

      {/* 3. Status Box: Compact Pill vs Full Description */}
      {/* Compact Pill (up to 1050px by default, or if compact=true) */}
      <Box
        sx={{
          display: isAlwaysCompact ? 'flex' : isNeverCompact ? 'none' : 'flex',
          '@media (min-width: 1051px)': {
            display: isAlwaysCompact ? 'flex' : 'none',
          },
          py: 1,
          px: 1.5,
          borderRadius: '10px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'divider' : '#F1F5F9'),
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', flexShrink: 0 }} />
        <Typography sx={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>
          {statusText}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
          - Available {displayHours}
        </Typography>
      </Box>

      {/* Full Description Box (above 1050px by default, or if compact=false) */}
      <Box
        sx={{
          display: isAlwaysCompact ? 'none' : isNeverCompact ? 'flex' : 'none',
          '@media (min-width: 1051px)': {
            display: isAlwaysCompact ? 'none' : 'flex',
          },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: '16px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          flexDirection: 'column',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Typography
          sx={{
            fontSize: '0.9375rem',
            color: '#64748B',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          {cardDescription}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 20, color: '#64748B' }} />
          <Typography sx={{ fontSize: '0.875rem', color: 'text.primary' }}>
            <Box component="span" sx={{ color: '#475569', fontWeight: 500 }}>
              Available{' '}
            </Box>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {displayHours}
            </Box>
          </Typography>
        </Box>
      </Box>

      {/* 4. WhatsApp CTA Button */}
      <ActionButton
        fullWidth
        startIcon={<WhatsAppIcon sx={{ fontSize: 22 }} />}
        onClick={handleWhatsAppClick}
        sx={{
          mt: 'auto',
          bgcolor: '#22C55E',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '1rem',
          borderRadius: '14px',
          py: 1.6,
          my: 1,
          boxShadow: 'none',
          '&:hover': {
            bgcolor: '#16A34A',
          },
        }}
      >
        Contact on WhatsApp
      </ActionButton>
    </Card>
  );
}
