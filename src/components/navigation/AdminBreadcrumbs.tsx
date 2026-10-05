'use client';

import { Breadcrumbs, Link as MuiLink, Typography } from '@mui/material';
import Link from 'next/link';
export type BreadcrumbItem = Readonly<{
  label: string;
  href?: string;
}>;

type AdminBreadcrumbsProps = Readonly<{
  items: readonly BreadcrumbItem[];
}>;

export default function AdminBreadcrumbs({ items }: AdminBreadcrumbsProps) {
  return (
    <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 2 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast || !item.href) {
          return (
            <Typography key={item.label} color="text.primary" variant="body2">
              {item.label}
            </Typography>
          );
        }

        return (
          <MuiLink
            key={item.label}
            component={Link}
            href={item.href}
            underline="hover"
            color="inherit"
            variant="body2"
          >
            {item.label}
          </MuiLink>
        );
      })}
    </Breadcrumbs>
  );
}
