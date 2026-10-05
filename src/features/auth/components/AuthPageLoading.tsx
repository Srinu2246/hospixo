import { Box, CircularProgress } from '@mui/material';

import { colors } from '@/lib/theme/mui/colors';

/** Placeholder while client-only auth forms mount (avoids LocatorJS SSR hydration drift). */
export function AuthPageLoading() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.auth.formPanel,
      }}
    >
      <CircularProgress size={32} sx={{ color: colors.auth.accent }} />
    </Box>
  );
}
