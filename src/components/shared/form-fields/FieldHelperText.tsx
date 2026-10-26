'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface FieldHelperTextProps {
  /** Error or helper copy; omit when reserving space only. */
  message?: string;
  /** Keeps one line of space so fields below do not shift when `message` appears. */
  reserveSpace?: boolean;
  sx?: SxProps<Theme>;
}

/** Inline helper/error row with optional fixed height (avoids layout jump on validate). */
export function FieldHelperText({
  message,
  reserveSpace = false,
  sx,
}: Readonly<FieldHelperTextProps>) {
  if (!message && !reserveSpace) return null;

  return (
    <Box
      sx={{
        mt: 0.5,
        minHeight: '1.125rem',
        lineHeight: '1.125rem',
        ...sx,
      }}
    >
      {message ? (
        <Typography
          variant="caption"
          component="span"
          sx={{
            fontSize: '0.75rem',
            color: 'error.main',
            display: 'block',
          }}
        >
          {message}
        </Typography>
      ) : null}
    </Box>
  );
}
