'use client';

import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { openOrdersPageMeta } from '@/features/pos/config/open-orders';

export interface OpenOrdersFooterProps {
  summaryText: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function OpenOrdersFooter({
  summaryText,
  page,
  totalPages,
  onPageChange,
}: Readonly<OpenOrdersFooterProps>) {
  return (
    <Stack
      component="footer"
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        mt: 3,
        pt: 2,
        borderTop: 1,
        borderColor: 'var(--pos-border)',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
        {summaryText}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          type="button"
          variant="outlined"
          size="small"
          sx={{
            minHeight: 36,
            borderColor: 'var(--pos-border-strong)',
            borderRadius: 'var(--pos-radius-sm)',
            color: 'text.primary',
            fontSize: 13,
            fontWeight: 600,
            textTransform: 'none',
          }}
        >
          {openOrdersPageMeta.downloadReportLabel}
        </Button>

        <Pagination
          count={totalPages}
          page={page}
          onChange={(_event, nextPage) => onPageChange(nextPage)}
          size="small"
          siblingCount={0}
          boundaryCount={1}
          aria-label="Orders pagination"
          sx={{
            '& .MuiPaginationItem-root': {
              minWidth: 36,
              height: 36,
              borderRadius: 'var(--pos-radius-sm)',
              fontSize: 13,
              fontWeight: 600,
            },
          }}
        />
      </Stack>
    </Stack>
  );
}
