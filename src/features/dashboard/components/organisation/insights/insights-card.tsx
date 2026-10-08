'use client';

import { Box, Button, Card, Typography } from '@mui/material';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import type { OrganisationInsight } from '@/features/dashboard/types/organisation-dashboard';

type InsightsCardProps = Readonly<{
  insights: readonly OrganisationInsight[];
  expandedInsightId: string | null;
  onToggleInsight: (insightId: string) => void;
}>;

export function InsightsCard({ insights, expandedInsightId, onToggleInsight }: InsightsCardProps) {
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
        {organisationDashboardCopy.insightsTitle}
      </Typography>

      {insights.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            py: 3,
            fontSize: '0.875rem',
          }}
        >
          No insights available
        </Typography>
      ) : (
        <Box
          component="ul"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {insights.map((insight) => (
            <Box
              component="li"
              key={insight.id}
              sx={{
                p: 1.5,
                borderRadius: '0.5rem',
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                }}
              >
                {insight.title}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  Confidence {insight.confidence}%
                </Typography>
                <Button
                  size="small"
                  onClick={() => onToggleInsight(insight.id)}
                  sx={{
                    p: 0,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'info.main',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  }}
                >
                  {organisationDashboardCopy.applyDetail}
                </Button>
              </Box>
              {expandedInsightId === insight.id ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'info.main',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(14, 165, 233, 0.08)',
                    p: 1,
                    borderRadius: '0.375rem',
                  }}
                >
                  Recommended action queued for review in your operations workspace.
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
