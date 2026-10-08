'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

export type CrudDetailHeaderProps = Readonly<{
  title: string;
  subtitle?: string;
  onBack: () => void;
  action?: ReactNode;
}>;

export function CrudDetailHeader({ title, subtitle, onBack, action }: CrudDetailHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
          sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {action ? <Box>{action}</Box> : null}
    </Box>
  );
}
