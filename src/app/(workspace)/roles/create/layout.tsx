'use client';

import { Suspense } from 'react';

import { CreateRoleProvider } from '@/features/user-roles/components/create-role/create-role-context';

export default function CreateRoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <CreateRoleProvider>{children}</CreateRoleProvider>
    </Suspense>
  );
}
