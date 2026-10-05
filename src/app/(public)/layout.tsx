import { Box } from '@mui/material';

export default function PublicAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box
      component="main"
      sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      {children}
    </Box>
  );
}
