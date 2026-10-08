'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export type CrudDetailCardField = Readonly<{
  label: string;
  value: ReactNode;
  bold?: boolean;
}>;

export type CrudDetailCardProps = Readonly<{
  title?: string;
  loading?: boolean;
  fields?: readonly CrudDetailCardField[];
  children?: ReactNode;
}>;

export function CrudDetailCard({ title, loading, fields, children }: CrudDetailCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: '12px', mb: children ? 3 : 0 }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        {title ? (
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
            {title}
          </Typography>
        ) : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {fields && fields.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2.5,
                }}
              >
                {fields.map((field) => (
                  <Box key={field.label}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 0.25 }}
                    >
                      {field.label}
                    </Typography>
                    {typeof field.value === 'string' || typeof field.value === 'number' ? (
                      <Typography variant="body1" sx={{ fontWeight: field.bold ? 600 : 400 }}>
                        {field.value}
                      </Typography>
                    ) : (
                      field.value
                    )}
                  </Box>
                ))}
              </Box>
            ) : null}
            {children}
          </>
        )}
      </CardContent>
    </Card>
  );
}
