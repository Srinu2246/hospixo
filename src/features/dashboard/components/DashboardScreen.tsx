'use client';

import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { colors } from '@/lib/theme/mui/colors';

const statCards = [
  {
    label: 'TOTAL SALES',
    value: '₹10,67,506',
    delta: '+8.1% vs prior week',
    deltaColor: colors.success.default,
  },
  {
    label: 'NET SALES',
    value: '₹9,28,125',
    delta: '+6.5% vs prior week',
    deltaColor: colors.success.default,
  },
  {
    label: 'COMPANIES',
    value: '0',
    delta: 'Active',
    deltaColor: colors.text.secondary,
  },
  {
    label: 'BRANCHES',
    value: '0',
    delta: 'Total',
    deltaColor: colors.text.secondary,
  },
] as const;

export function DashboardScreen() {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          px: 2,
          py: 1.25,
          borderRadius: 1,
          bgcolor: '#FFF7ED',
          border: '1px solid #FED7AA',
          color: '#9A3412',
          fontSize: '0.875rem',
        }}
      >
        No companies are set up for this organization yet.
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        {statCards.map((card) => (
          <Paper
            key={card.label}
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: `1px solid ${colors.border.default}`,
              bgcolor: colors.surface.default,
            }}
          >
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: colors.text.secondary,
                    mb: 0.75,
                  }}
                >
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.2 }}>
                  {card.value}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: card.deltaColor, mt: 0.5 }}>
                  {card.delta}
                </Typography>
              </Box>
              <TrendingUpOutlinedIcon sx={{ color: colors.auth.accent, fontSize: '1.1rem' }} />
            </Stack>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1.5,
          border: `1px solid ${colors.border.default}`,
          bgcolor: colors.surface.default,
          minHeight: 280,
        }}
      >
        <Stack
          direction="row"
          sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: colors.text.secondary,
            }}
          >
            COMPANY PERFORMANCE
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: colors.surface.light,
                border: `1px solid ${colors.border.default}`,
              }}
            >
              Total Sales
            </Box>
            <ShowChartOutlinedIcon sx={{ color: colors.text.secondary, fontSize: '1.1rem' }} />
          </Stack>
        </Stack>
        <Box
          sx={{
            height: 200,
            borderRadius: 1,
            border: `1px dashed ${colors.border.light}`,
            bgcolor: colors.background.light,
          }}
        />
      </Paper>

      <Typography
        sx={{
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: colors.text.secondary,
          mb: 1.5,
        }}
      >
        OPERATIONS SUMMARY
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: `1px solid ${colors.border.default}`,
            bgcolor: colors.surface.default,
            minHeight: 220,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 2 }}>TAX SUMMARY</Typography>
          <Box
            sx={{
              width: 140,
              height: 140,
              mx: 'auto',
              borderRadius: '50%',
              background: `conic-gradient(${colors.auth.accent} 0 45%, #8B5CF6 45% 70%, ${colors.success.default} 70% 100%)`,
            }}
          />
        </Paper>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 1.5,
            border: `1px solid ${colors.border.default}`,
            bgcolor: colors.surface.default,
            minHeight: 220,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 2 }}>
            FINANCIAL BREAKDOWN
          </Typography>
          <Stack spacing={1.25}>
            {[
              { color: colors.auth.accent, width: '78%' },
              { color: '#8B5CF6', width: '62%' },
              { color: colors.success.default, width: '48%' },
              { color: colors.warning.default, width: '35%' },
            ].map((bar, index) => (
              <Box
                key={index}
                sx={{
                  height: 10,
                  width: bar.width,
                  borderRadius: 999,
                  bgcolor: bar.color,
                }}
              />
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
