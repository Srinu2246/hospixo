import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';

export function MenuAvailabilityHeader() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem 1rem',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'text.primary',
            fontSize: '1.375rem',
            m: 0,
          }}
        >
          {menuAvailabilityCopy.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            m: 0,
          }}
        >
          {menuAvailabilityCopy.subtitle}
        </Typography>
      </Box>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.5,
          borderRadius: 999,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#15803d',
          bgcolor: '#ecfdf5',
          border: '1px solid #bbf7d0',
        }}
      >
        {menuAvailabilityCopy.synced}
      </Box>
    </Box>
  );
}
