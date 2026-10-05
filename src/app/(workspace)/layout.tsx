import { WorkspaceShell } from '@/components/layout/workspace/WorkspaceShell';

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
