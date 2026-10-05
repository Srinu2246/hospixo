import type { Metadata } from 'next';
import Link from 'next/link';

import { routes } from '@/config/routes';

export const metadata: Metadata = { title: 'Edit Role' };

type EditRoleRouteProps = Readonly<{
  params: Promise<{ roleId: string }>;
}>;

export default async function EditRoleRoute({ params }: EditRoleRouteProps) {
  const { roleId } = await params;

  return (
    <div className="space-y-4 p-2">
      <h1 className="text-2xl font-semibold text-foreground">Edit role</h1>
      <p className="text-sm text-muted-foreground">Role ID: {roleId}</p>
      <p className="text-sm text-muted-foreground">Full edit-role UI is coming soon.</p>
      <Link
        href={routes.platform.usersRoles.roles.company}
        className="text-primary text-sm font-medium"
      >
        Back to roles
      </Link>
    </div>
  );
}
