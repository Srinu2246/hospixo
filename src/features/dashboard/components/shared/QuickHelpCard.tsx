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
}

export function QuickHelpCard({
  idLabel = 'Outlet ID: 63284',
  showPocBadge = true,
  statusText = 'Online',
  description,
  availableHours,
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

  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '24px',
        borderColor: (theme) => (theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0'),
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.background.paper : '#FFFFFF',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Header: Quick Help & Outlet ID Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <HelpOutlineRoundedIcon sx={{ fontSize: 24, color: 'text.primary' }} />
          <Typography
            sx={{
              fontSize: '1.125rem',
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
              fontSize: '0.8125rem',
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
              fontSize: '0.875rem',
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {parsedIdValue}
          </Box>
        </Box>
      </Box>

      {/* 2. Account Manager Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src="/images/kumar_reddy.jpg"
          alt="Kumar Reddy"
          sx={{ width: 64, height: 64, borderRadius: '50%' }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            sx={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
            }}
          >
            Kumar Reddy
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {showPocBadge && (
              <Box
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  color: '#64748B',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                POINT OF CONTACT (POC)
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
              <Typography sx={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600 }}>
                {statusText}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 3. Description Box */}
      <Box
        sx={{
          p: 3,
          borderRadius: '16px',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
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
