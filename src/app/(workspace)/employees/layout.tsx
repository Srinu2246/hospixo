import { UsersRolesShell } from '@/features/user-roles/components/layout/users-roles-shell';

export default function UsersRolesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UsersRolesShell>{children}</UsersRolesShell>;
}
