'use client';

import { useSyncExternalStore } from 'react';

import { teamUsers } from '@/features/user-roles/config/users';
import type { TeamUser } from '@/features/user-roles/config/users';
import {
  getMergedTeamUser,
  getMergedTeamUsers,
} from '@/features/user-roles/lib/staff-profile-store';

const STORAGE_KEY = 'hospixo.staff-overrides';

/** Stable SSR snapshot — sessionStorage is unavailable on the server. */
const SERVER_TEAM_USERS_SNAPSHOT: TeamUser[] = teamUsers;

const SERVER_TEAM_USER_BY_ID = new Map(teamUsers.map((user) => [user.id, user] as const));

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) onStoreChange();
  }

  window.addEventListener('storage', handleStorage);
  window.addEventListener('staff-profile-updated', onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('staff-profile-updated', onStoreChange);
  };
}

function getServerTeamUsersSnapshot(): TeamUser[] {
  return SERVER_TEAM_USERS_SNAPSHOT;
}

function getServerTeamUserSnapshot(staffId: string): TeamUser | undefined {
  return SERVER_TEAM_USER_BY_ID.get(staffId);
}

export function notifyStaffProfileUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('staff-profile-updated'));
}

export function useMergedTeamUsers(): TeamUser[] {
  return useSyncExternalStore(subscribe, getMergedTeamUsers, getServerTeamUsersSnapshot);
}

export function useMergedTeamUser(staffId: string): TeamUser | undefined {
  return useSyncExternalStore(
    subscribe,
    () => getMergedTeamUser(staffId),
    () => getServerTeamUserSnapshot(staffId),
  );
}
