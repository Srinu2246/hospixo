import { Box, CircularProgress, Typography } from '@mui/material';

type LoadingStateProps = Readonly<{
  label?: string;
}>;

export default function LoadingState({ label = 'Loading…' }: LoadingStateProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
