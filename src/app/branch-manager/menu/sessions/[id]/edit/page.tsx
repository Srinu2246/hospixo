import { SessionsPage } from '@/features/menu/sessions';

interface EditSessionRouteProps {
  params: Promise<{ id: string }>;
}

export default async function BranchManagerEditSessionRoute({ params }: EditSessionRouteProps) {
  const { id } = await params;
  return (
    <SessionsPage
      initialMode="edit"
      initialSessionId={id}
      basePath="/branch-manager/menu/sessions"
    />
  );
}
