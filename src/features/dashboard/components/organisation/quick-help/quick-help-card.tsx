'use client';

import { Avatar, Box, Button, Card, Chip, Typography } from '@mui/material';
import { MessageCircle } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import type { OrganisationAccountManager } from '@/features/dashboard/types/organisation-dashboard';

type QuickHelpCardProps = Readonly<{
  accountManager: OrganisationAccountManager;
}>;

export function QuickHelpCard({ accountManager }: QuickHelpCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {organisationDashboardCopy.quickHelpTitle}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'info.main',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.875rem',
          }}
        >
          {accountManager.avatarInitials}
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
            {accountManager.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block' }}
          >
            {accountManager.role}
          </Typography>
          {accountManager.isOnline ? (
            <Chip
              size="small"
              label="Online Now"
              sx={{
                height: 18,
                fontSize: '0.625rem',
                fontWeight: 700,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.16)'
                    : 'rgba(34, 197, 94, 0.12)',
                color: 'success.main',
                mt: 0.5,
              }}
            />
          ) : null}
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 0.5 }}
      >
        ID {accountManager.employeeId}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontSize: '0.75rem', display: 'block', mb: 2 }}
      >
        {accountManager.availability}
      </Typography>

      <Button
        component="a"
        href={`https://wa.me/${accountManager.whatsappPhone}`}
        target="_blank"
        rel="noreferrer"
        variant="contained"
        startIcon={<MessageCircle size={16} />}
        sx={{
          mt: 'auto',
          bgcolor: '#25D366',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          borderRadius: '0.5rem',
          py: 0.75,
          '&:hover': {
            bgcolor: '#128C7E',
          },
        }}
      >
        {organisationDashboardCopy.contactWhatsApp}
      </Button>
    </Card>
  );
}
