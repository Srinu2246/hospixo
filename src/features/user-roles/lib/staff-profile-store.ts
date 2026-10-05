import type { TeamUser } from '@/features/user-roles/config/users';
import { teamUsers } from '@/features/user-roles/config/users';

const STORAGE_KEY = 'hospixo.staff-overrides';

export type StaffProfileOverride = Partial<
  Pick<
    TeamUser,
    | 'firstName'
    | 'lastName'
    | 'email'
    | 'phone'
    | 'role'
    | 'branch'
    | 'department'
    | 'startDate'
    | 'employmentType'
  >
>;

function readAll(): Record<string, StaffProfileOverride> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StaffProfileOverride>;
  } catch {
    return {};
  }
}

export function readStaffProfileOverride(staffId: string): StaffProfileOverride | undefined {
  return readAll()[staffId];
}

let cachedUsers: TeamUser[] | null = null;
let cachedOverridesKey = '';

function getOverridesKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function invalidateMergedTeamUserCache() {
  cachedUsers = null;
  cachedOverridesKey = '';
}

export function saveStaffProfileOverride(staffId: string, override: StaffProfileOverride): void {
  if (typeof window === 'undefined') return;
  try {
    const all = readAll();
    all[staffId] = { ...all[staffId], ...override };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    invalidateMergedTeamUserCache();
  } catch {
    /* ignore */
  }
}

export function mergeTeamUser(user: TeamUser, override?: StaffProfileOverride): TeamUser {
  if (!override) return user;
  const merged = { ...user, ...override };
  const nameChanged =
    (override.firstName !== undefined && override.firstName !== user.firstName) ||
    (override.lastName !== undefined && override.lastName !== user.lastName);

  if (nameChanged) {
    return { ...merged, avatarSrc: undefined };
  }

  return merged;
}

export function getMergedTeamUser(staffId: string): TeamUser | undefined {
  return getMergedTeamUsers().find((user) => user.id === staffId);
}

export function getMergedTeamUsers(): TeamUser[] {
  const overridesKey = getOverridesKey();
  if (cachedUsers && cachedOverridesKey === overridesKey) {
    return cachedUsers;
  }

  const overrides = readAll();
  cachedOverridesKey = overridesKey;
  cachedUsers = teamUsers.map((user) => mergeTeamUser(user, overrides[user.id]));
  return cachedUsers;
}
