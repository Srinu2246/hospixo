'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type { UserRoleStatsData } from '@/lib/schemas/employees/user-roles/userRolesSchema';

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
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
            border: (theme) =>
              `1px solid ${
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default
              }`,
            borderRadius: '12px',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'text.secondary',
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
              lineHeight: 1.2,
            }}
          >
            {item.value}
          </Typography>
        </Card>
      ))}
    </Box>
  );
}
