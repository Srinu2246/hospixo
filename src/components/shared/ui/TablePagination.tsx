'use client';

import { Box, Button, Typography } from '@mui/material';

export type TablePaginationProps = Readonly<{
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  summary?: string;
  previousLabel?: string;
  nextLabel?: string;
  lastLabel?: string;
}>;

const navButtonSx = {
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  minWidth: 72,
  height: 32,
  px: 1.5,
  borderRadius: '0.375rem',
  borderColor: 'divider',
  color: 'text.primary',
  bgcolor: 'background.paper',
} as const;

function pageWindow(page: number, pageCount: number): number[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  return [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);
}

export function TablePagination({
  page,
  pageCount,
  onPageChange,
  summary,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  lastLabel = 'Last',
}: TablePaginationProps) {
  const pages = pageWindow(page, pageCount);
  const atFirst = page <= 1;
  const atLast = page >= pageCount;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
      }}
    >
      {summary ? (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>{summary}</Typography>
      ) : (
        <Box />
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={atFirst}
          onClick={() => onPageChange(page - 1)}
          sx={navButtonSx}
        >
          {previousLabel}
        </Button>

        {pages.map((pageNumber, index) => {
          const previous = pages[index - 1];
          const showGap = previous != null && pageNumber - previous > 1;
          const selected = pageNumber === page;

          return (
            <Box key={pageNumber} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              {showGap ? (
                <Typography sx={{ px: 0.25, color: 'text.secondary', fontSize: '0.8125rem' }}>
                  …
                </Typography>
              ) : null}
              <Button
                type="button"
                size="small"
                variant={selected ? 'contained' : 'outlined'}
                aria-current={selected ? 'page' : undefined}
                onClick={() => onPageChange(pageNumber)}
                sx={{
                  ...navButtonSx,
                  minWidth: 32,
                  px: 0,
                  ...(selected
                    ? {
                        bgcolor: 'primary.main',
                        borderColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }
                    : {}),
                }}
              >
                {pageNumber}
              </Button>
            </Box>
          );
        })}

        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={atLast}
          onClick={() => onPageChange(page + 1)}
          sx={{ ...navButtonSx, minWidth: 56 }}
        >
          {nextLabel}
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={atLast}
          onClick={() => onPageChange(pageCount)}
          sx={{ ...navButtonSx, minWidth: 56 }}
        >
          {lastLabel}
        </Button>
      </Box>
    </Box>
  );
}
