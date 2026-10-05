'use client';

import type { ReactNode } from 'react';

import { OrganizationCreateProvider } from '@/context/organization-create';
import { OrganizationCreateBreadcrumbs } from '@/components/organization/create/components/organization-create-breadcrumbs/organization-create-breadcrumbs';

export default function OrganizationCreateLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <OrganizationCreateProvider>
      <OrganizationCreateBreadcrumbs />
      {children}
    </OrganizationCreateProvider>
  );
}
