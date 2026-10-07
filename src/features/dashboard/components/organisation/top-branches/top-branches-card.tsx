'use client';

import { useRouter } from 'next/navigation';
import { Box, Card, Typography } from '@mui/material';
import { TrendingUp } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import type { OrganisationBranchRank } from '@/features/dashboard/types/organisation-dashboard';

type TopBranchesCardProps = Readonly<{
  branches: readonly OrganisationBranchRank[];
}>;

export function TopBranchesCard({ branches }: TopBranchesCardProps) {
  const router = useRouter();

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
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
        {organisationDashboardCopy.topBranchesTitle}
      </Typography>

      {branches.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            py: 3,
            fontSize: '0.875rem',
          }}
        >
          No branches available
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {branches.map((branch) => (
            <Box
              component="li"
              key={branch.id}
              onClick={() => router.push(`/branch?outlet=${encodeURIComponent(String(branch.id))}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                p: 1,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(56, 189, 248, 0.16)'
                        : 'rgba(14, 165, 233, 0.12)',
                    color: 'info.main',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {branch.rank}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.3,
                    }}
                  >
                    {branch.branchName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      display: 'block',
                      mt: 0.25,
                    }}
                  >
                    {branch.companyName}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                <TrendingUp size={14} color="#16a34a" />
                {formatCurrency(branch.revenue)}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
