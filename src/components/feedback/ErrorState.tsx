import { Alert, Box } from '@mui/material';

type ErrorStateProps = Readonly<{
  message: string;
}>;

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <Box sx={{ py: 2 }}>
      <Alert severity="error">{message}</Alert>
    </Box>
  );
}
