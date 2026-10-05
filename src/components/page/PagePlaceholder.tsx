import { Box, Typography } from '@mui/material';

import PageHeader from '@/components/page/PageHeader';

type PagePlaceholderProps = Readonly<{
  title: string;
  description?: string;
}>;

export default function PagePlaceholder({
  title,
  description = 'This screen is migrated from hospixo admin. Feature UI will be ported next.',
}: PagePlaceholderProps) {
  return (
    <Box>
      <PageHeader title={title} />
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Box>
  );
}
