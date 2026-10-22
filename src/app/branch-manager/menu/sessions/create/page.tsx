import { SessionsPage } from '@/features/menu/sessions';

export default function BranchManagerCreateSessionRoute() {
  return <SessionsPage initialMode="create" basePath="/branch-manager/menu/sessions" />;
}
