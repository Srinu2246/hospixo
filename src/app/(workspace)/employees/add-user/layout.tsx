'use client';

import { Suspense } from 'react';

import { AddUserProvider } from '@/features/user-roles/components/add-user/add-user-context';
import { CreateRoleProvider } from '@/features/user-roles/components/create-role/create-role-context';

export default function AddUserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={null}>
      <AddUserProvider>
        <CreateRoleProvider>{children}</CreateRoleProvider>
      </AddUserProvider>
    </Suspense>
  );
}
