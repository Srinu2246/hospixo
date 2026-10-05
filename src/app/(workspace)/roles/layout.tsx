import { UsersRolesShell } from '@/features/user-roles/components/layout/users-roles-shell';

export default function RolesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UsersRolesShell>{children}</UsersRolesShell>;
}
