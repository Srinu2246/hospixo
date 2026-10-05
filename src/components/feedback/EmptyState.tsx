import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type EmptyStateProps = Readonly<{
  title: string;
  description?: string;
  action?: ReactNode;
}>;

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        px: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: action ? 2 : 0 }}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Box>
  );
}
