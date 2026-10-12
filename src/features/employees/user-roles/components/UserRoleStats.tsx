'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type { UserRoleStatsData } from '../types';

export interface UserRoleStatsProps {
  stats: UserRoleStatsData;
}

export function UserRoleStats({ stats }: Readonly<UserRoleStatsProps>) {
  const statItems = [
    { label: 'TOTAL USERS', value: stats.totalUsers },
    { label: 'ACTIVE NOW', value: stats.activeNow },
    { label: 'PENDING INVITES', value: stats.pendingInvites },
    { label: 'USER ROLES', value: stats.userRoles },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: { xs: 1.5, md: 2 },
        width: '100%',
      }}
    >
      {statItems.map((item) => (
        <Card
          key={item.label}
          variant="outlined"
          padding={2}
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
            borderRadius: '10px',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            minHeight: 84,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: 'none',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: colors.text.secondary,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.15,
              mt: 0.25,
              letterSpacing: '-0.02em',
            }}
          >
            {item.value}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}

export default UserRoleStats;
