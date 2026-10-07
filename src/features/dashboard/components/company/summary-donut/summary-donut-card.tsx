import { Box, Card, Stack, Typography } from '@mui/material';

import type { DashboardBreakdownItem } from '@/features/dashboard/types';
import { formatCompactCurrency } from '@/features/dashboard/lib/format';

type SummaryDonutCardProps = Readonly<{
  title: string;
  total: number;
  items: readonly DashboardBreakdownItem[];
}>;

function buildDonutGradient(items: readonly DashboardBreakdownItem[], total: number) {
  let cursor = 0;

  return items
    .map((item) => {
      const share = total > 0 ? (item.amount / total) * 100 : 0;
      const start = cursor;
      cursor += share;
      return `${item.color} ${start}% ${cursor}%`;
    })
    .join(', ');
}

export function SummaryDonutCard({ title, total, items }: SummaryDonutCardProps) {
  const gradient = buildDonutGradient(items, total);

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

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
          mt: 2.5,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 136,
            height: 136,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background:
                items.length > 0 && total > 0
                  ? `conic-gradient(${gradient})`
                  : (theme) => theme.palette.divider,
            }}
            aria-hidden="true"
          />
          <Box
            sx={{
              position: 'absolute',
              inset: '22%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {formatCompactCurrency(total)}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.25} sx={{ flex: 1, width: '100%' }}>
          {items.map((item) => (
            <Box
              key={item.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                fontSize: '0.8125rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.8125rem' }}>
                  {item.label}
                  {item.shareLabel ? (
                    <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
                      ({item.shareLabel})
                    </Box>
                  ) : null}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                }}
              >
                {formatCompactCurrency(item.amount)}
              </Typography>
            </Box>
          ))}
          {items.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              No breakdown data
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}
