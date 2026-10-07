'use client';

import { Avatar, Box, Button, Card, Typography } from '@mui/material';
import { Clock, MessageCircle } from 'lucide-react';

import { companyLandingContent } from '@/features/dashboard/config/company';

type QuickHelpCardProps = Readonly<{
  name: string;
  phone: string;
  online: boolean;
  supportId: string;
  supportHours: string;
  supportMessage: string;
}>;

export function QuickHelpCard({
  name,
  phone,
  online,
  supportId,
  supportHours,
  supportMessage,
}: QuickHelpCardProps) {
  const { title, onlineStatus, offlineStatus, whatsappCta } = companyLandingContent.quickHelp;
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex' }}>
            <Clock size={16} aria-hidden />
          </Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          ID: {supportId}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.light',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          {name.charAt(0)}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: online ? 'success.main' : 'text.disabled',
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {online ? onlineStatus : offlineStatus}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          bgcolor: 'action.hover',
          p: 1.5,
          borderRadius: '0.5rem',
          mb: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
          {supportMessage}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
          <Clock size={12} aria-hidden />
          <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
            {supportHours}
          </Typography>
        </Box>
      </Box>

      <Button
        component="a"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="contained"
        color="success"
        startIcon={<MessageCircle size={16} />}
        fullWidth
        sx={{
          mt: 'auto',
          borderRadius: '0.5rem',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
        }}
      >
        {whatsappCta}
      </Button>
    </Card>
  );
}
