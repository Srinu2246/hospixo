'use client';

import { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { useAuth } from '@/context/auth';
import {
  resolveAccessLevel,
  resolveRoleManagementLevel,
  type AccessLevel,
  type HierarchyAccessLevel,
} from '@/lib/auth/access-level';

const NAV_SCOPE_STORAGE_KEY = 'hospixo.nav.scope';

function readNavScope(): HierarchyAccessLevel | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(NAV_SCOPE_STORAGE_KEY);
    if (value === 'organisation' || value === 'company' || value === 'branch') {
      return value;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeNavScope(scope: HierarchyAccessLevel) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(NAV_SCOPE_STORAGE_KEY, scope);
  } catch {
    /* ignore */
  }
}

function parseScopeParam(value: string | null): HierarchyAccessLevel | null {
  if (value === 'organisation' || value === 'company' || value === 'branch') {
    return value;
  }
  return null;
}

/** Effective org/company/branch context for role template filtering. */
export function useRoleManagementLevel(): AccessLevel {
  const { user } = useAuth();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const scopeParam = searchParams?.get('scope') ?? null;
  const [storedNavScope] = useState<HierarchyAccessLevel | null>(readNavScope);

  return useMemo(() => {
    const userLevel: AccessLevel = user
      ? resolveAccessLevel({
          roles: user.roles,
          scope: user.scope,
          company_id: user.company_id,
          branch_id: user.branch_id,
        })
      : 'company';

    const explicitScope = parseScopeParam(scopeParam) ?? storedNavScope;
    const level = resolveRoleManagementLevel(pathname, userLevel, explicitScope) ?? 'company';

    if (level === 'organisation' || level === 'company' || level === 'branch') {
      writeNavScope(level);
    }

    return level;
  }, [user, pathname, scopeParam, storedNavScope]);
}

/** Append `?scope=` so shared wizard routes keep the active hierarchy level. */
export function withRoleScope(href: string, level: AccessLevel): string {
  if (level !== 'organisation' && level !== 'company' && level !== 'branch') {
    return href;
  }
  return withSearchParams(href, { scope: level });
}

/** Merge query params onto a path that may already include `?scope=`. */
export function withSearchParams(href: string, params: Record<string, string>): string {
  const url = new URL(href, 'http://local');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}`;
}
