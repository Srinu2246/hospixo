'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  canCreateRoleTemplate,
  getDefaultRoleTemplateId,
  getTemplateById,
  type PermissionGroup,
  type RoleTemplateId,
} from '@/features/user-roles/config/roles';
import { useRoleManagementLevel } from '@/features/user-roles/hooks/use-role-management-level';

export type AddUserScope = 'organisation' | 'company' | 'branch';

export interface AddUserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** Unused in invite flow — invitee sets password on accept. */
  password: string;
  scope: AddUserScope;
  company: string;
  companyId: number | null;
  branch: string;
  /**
   * Real branch_id must come from GET /api/v1/branches (or auth session).
   * Do not hardcode — branch-scoped roles 400 without a valid id.
   */
  branchId: number | null;
  /** Real role id from the backend roles list, kept for the final submit payload. */
  roleId: string | null;
  sendInvite: boolean;
  message: string;
}

interface AddUserState {
  selectedTemplateId: RoleTemplateId | null;
  roleName: string;
  description: string;
  /** Full selectable catalog from GET /permissions/grouped (auth + unavailable excluded). */
  permissionCatalog: PermissionGroup[];
  permissionGroups: PermissionGroup[];
  user: AddUserDetails;
  setSelectedTemplateId: (id: RoleTemplateId | null) => void;
  setRoleName: (value: string) => void;
  setDescription: (value: string) => void;
  setPermissionEnabled: (groupId: string, permissionId: string, enabled: boolean) => void;
  toggleAllInGroup: (groupId: string, enabled: boolean) => void;
  setPermissionCatalog: (groups: PermissionGroup[]) => void;
  setPermissionGroups: (groups: PermissionGroup[]) => void;
  setUser: (patch: Partial<AddUserDetails>) => void;
  reset: () => void;
  /** Staff id used after create/invite for Edit Staff deep-link. */
  draftStaffId: string;
  setDraftStaffId: (id: string) => void;
  /** Pending invitation id from POST /api/invitations (for resend). */
  invitationId: string | null;
  setInvitationId: (id: string | null) => void;
  invitationStatus: string | null;
  setInvitationStatus: (status: string | null) => void;
}

const STORAGE_KEY = 'hospixo.add-user';

const DEFAULT_USER: AddUserDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  scope: 'branch',
  company: '',
  companyId: null,
  branch: '',
  branchId: null,
  roleId: null,
  sendInvite: true,
  message: 'Welcome to the team! Here is your access to Hospixo.',
};

const AddUserContext = createContext<AddUserState | null>(null);

function cloneCatalogGroups(catalog: PermissionGroup[]): PermissionGroup[] {
  return catalog.map((group) => ({
    ...group,
    permissions: group.permissions.map((permission) => ({
      ...permission,
      enabled: false,
    })),
  }));
}

function applyTemplateDefaults(id: RoleTemplateId | null): {
  roleName: string;
  description: string;
} {
  const template = getTemplateById(id);
  if (!template) {
    return {
      roleName: 'Custom Role',
      description: 'Define a tailored permission set.',
    };
  }
  return {
    roleName: template.title,
    description: template.description,
  };
}

export function AddUserProvider({ children }: { children: React.ReactNode }) {
  const level = useRoleManagementLevel();
  const [selectedTemplateId, setSelectedTemplateIdState] = useState<RoleTemplateId | null>(null);
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionCatalog, setPermissionCatalogState] = useState<PermissionGroup[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [user, setUserState] = useState<AddUserDetails>(DEFAULT_USER);
  const [draftStaffId, setDraftStaffId] = useState('u-new-invite');
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [invitationStatus, setInvitationStatus] = useState<string | null>(null);

  const effectiveTemplateId = useMemo(() => {
    if (selectedTemplateId && canCreateRoleTemplate(level, selectedTemplateId)) {
      return selectedTemplateId;
    }
    return getDefaultRoleTemplateId(level);
  }, [selectedTemplateId, level]);

  useEffect(() => {
    // sessionStorage isn't reachable during SSR, so this state can only be
    // hydrated post-mount — an initializer can't do it, hence the effect.
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedTemplateId) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-storage hydration
          setSelectedTemplateIdState(parsed.selectedTemplateId);
        }
        if (parsed.roleName) {
          setRoleName(parsed.roleName);
        }
        if (parsed.description) {
          setDescription(parsed.description);
        }
        if (parsed.permissionGroups) {
          setPermissionGroups(parsed.permissionGroups);
        }
        if (parsed.user) {
          const hydratedUser = { ...parsed.user };
          delete hydratedUser.branch;
          delete hydratedUser.branchId;
          delete hydratedUser.roleId;

          setUserState({ ...DEFAULT_USER, ...hydratedUser });
        }
        if (parsed.draftStaffId) {
          setDraftStaffId(parsed.draftStaffId);
        }
        if (parsed.invitationId) {
          setInvitationId(parsed.invitationId);
        }
        if (parsed.invitationStatus) {
          setInvitationStatus(parsed.invitationStatus);
        }
        return;
      }
    } catch {
      // Fall through to defaults
    }

    const defaultId = getDefaultRoleTemplateId(level);

    setSelectedTemplateIdState(defaultId);
    const defaults = applyTemplateDefaults(defaultId);

    setRoleName(defaults.roleName);

    setDescription(defaults.description);

    setPermissionGroups([]);
  }, [level]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          selectedTemplateId: effectiveTemplateId,
          roleName,
          description,
          permissionGroups,
          user,
          draftStaffId,
          invitationId,
          invitationStatus,
        }),
      );
    } catch {
      /* ignore storage quota */
    }
  }, [
    effectiveTemplateId,
    roleName,
    description,
    permissionGroups,
    user,
    draftStaffId,
    invitationId,
    invitationStatus,
  ]);

  const selectTemplate = useCallback((id: RoleTemplateId | null) => {
    setSelectedTemplateIdState(id);
    const defaults = applyTemplateDefaults(id);
    setRoleName(defaults.roleName);
    setDescription(defaults.description);
  }, []);

  const setPermissionEnabled = useCallback(
    (groupId: string, permissionId: string, enabled: boolean) => {
      setPermissionGroups((groups) =>
        groups.map((group) =>
          group.id !== groupId
            ? group
            : {
                ...group,
                permissions: group.permissions.map((permission) =>
                  permission.id === permissionId ? { ...permission, enabled } : permission,
                ),
              },
        ),
      );
    },
    [],
  );

  const toggleAllInGroup = useCallback((groupId: string, enabled: boolean) => {
    setPermissionGroups((groups) =>
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              permissions: group.permissions.map((permission) => ({
                ...permission,
                enabled: permission.available === false ? permission.enabled : enabled,
              })),
            },
      ),
    );
  }, []);

  const replacePermissionGroups = useCallback((groups: PermissionGroup[]) => {
    setPermissionGroups(groups);
  }, []);

  const setPermissionCatalog = useCallback((groups: PermissionGroup[]) => {
    setPermissionCatalogState(groups);
  }, []);

  const patchUser = useCallback((patch: Partial<AddUserDetails>) => {
    setUserState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    const defaultId = getDefaultRoleTemplateId(level);
    setSelectedTemplateIdState(defaultId);
    const defaults = applyTemplateDefaults(defaultId);
    const defaultTemplate = getTemplateById(defaultId);
    const defaultScope: AddUserScope =
      defaultTemplate?.scope === 'organisation' ||
      defaultTemplate?.scope === 'company' ||
      defaultTemplate?.scope === 'branch'
        ? defaultTemplate.scope
        : 'branch';
    setRoleName(defaults.roleName || 'Branch Manager');
    setDescription(
      defaults.description || 'Manages staff and inventory at a specific branch level.',
    );
    setPermissionGroups(cloneCatalogGroups(permissionCatalog));
    setUserState(DEFAULT_USER);
    setUserState({
      ...DEFAULT_USER,
      scope: defaultScope,
    });
    setDraftStaffId('u-new-invite');
    setInvitationId(null);
    setInvitationStatus(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore quota / private mode */
    }
  }, [level, permissionCatalog]);

  const value = useMemo(
    () => ({
      selectedTemplateId: effectiveTemplateId,
      roleName,
      description,
      permissionCatalog,
      permissionGroups,
      user,
      setSelectedTemplateId: selectTemplate,
      setRoleName,
      setDescription,
      setPermissionEnabled,
      toggleAllInGroup,
      setPermissionCatalog,
      setPermissionGroups: replacePermissionGroups,
      setUser: patchUser,
      reset,
      draftStaffId,
      setDraftStaffId,
      invitationId,
      setInvitationId,
      invitationStatus,
      setInvitationStatus,
    }),
    [
      effectiveTemplateId,
      roleName,
      description,
      permissionCatalog,
      permissionGroups,
      user,
      selectTemplate,
      setPermissionEnabled,
      toggleAllInGroup,
      setPermissionCatalog,
      replacePermissionGroups,
      patchUser,
      reset,
      draftStaffId,
      invitationId,
      invitationStatus,
    ],
  );

  return <AddUserContext.Provider value={value}>{children}</AddUserContext.Provider>;
}

export function useAddUser() {
  const ctx = useContext(AddUserContext);
  if (!ctx) throw new Error('useAddUser must be used within AddUserProvider');
  return ctx;
}
