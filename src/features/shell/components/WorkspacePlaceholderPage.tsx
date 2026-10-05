import { Box, Paper, Typography } from '@mui/material';

import { colors } from '@/lib/theme/mui/colors';

type WorkspacePlaceholderPageProps = Readonly<{
  title: string;
  description?: string;
}>;

export function WorkspacePlaceholderPage({ title, description }: WorkspacePlaceholderPageProps) {
  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: `1px solid ${colors.border.default}`,
          bgcolor: colors.surface.default,
        }}
      >
        <Typography sx={{ color: colors.text.secondary }}>
          {description ?? 'This workspace section will be wired to the platform API.'}
        </Typography>
      </Paper>
    </Box>
  );
}
