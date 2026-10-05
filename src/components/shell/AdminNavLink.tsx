'use client';

import Link from 'next/link';
import { useLinkStatus } from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@/helpers/cn';

import styles from './admin-nav-link.module.css';

type AdminNavLinkProps = ComponentProps<typeof Link> & {
  pendingClassName?: string;
};

function AdminNavLinkInner({
  children,
  pendingClassName,
}: Readonly<{
  children: ReactNode;
  pendingClassName?: string;
}>) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={cn(styles.inner, pending && pendingClassName)}
      aria-busy={pending || undefined}
    >
      {children}
    </span>
  );
}

export default function AdminNavLink({
  children,
  className,
  prefetch = true,
  pendingClassName,
  ...props
}: AdminNavLinkProps) {
  return (
    <Link {...props} prefetch={prefetch} className={className}>
      <AdminNavLinkInner pendingClassName={pendingClassName}>{children}</AdminNavLinkInner>
    </Link>
  );
}
