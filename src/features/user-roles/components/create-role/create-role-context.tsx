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

export type CreateRoleFlow = 'create-role' | 'create-template';

interface CreateRoleState {
  flow: CreateRoleFlow;
  selectedTemplateId: RoleTemplateId | null;
  roleName: string;
  description: string;
  permissionCatalog: PermissionGroup[];
  permissionGroups: PermissionGroup[];
  templateReturnTo: string | null;
  setFlow: (flow: CreateRoleFlow) => void;
  setSelectedTemplateId: (id: RoleTemplateId | null) => void;
  startCustomTemplate: (returnTo: string) => void;
  setRoleName: (value: string) => void;
  setDescription: (value: string) => void;
  setPermissionCatalog: (groups: PermissionGroup[]) => void;
  setPermissionGroups: (groups: PermissionGroup[]) => void;
  setPermissionEnabled: (groupId: string, permissionId: string, enabled: boolean) => void;
  toggleAllInGroup: (groupId: string, enabled: boolean) => void;
  reset: () => void;
}

const STORAGE_KEY = 'hospixo.create-role';

const CreateRoleContext = createContext<CreateRoleState | null>(null);

function cloneCatalogGroups(catalog: readonly PermissionGroup[]): PermissionGroup[] {
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
    return { roleName: '', description: '' };
  }
  if (template.id === 'branch-manager') {
    return {
      roleName: template.title,
      description: 'Manages staff and inventory at a specific branch level.',
    };
  }
  return { roleName: template.title, description: template.description };
}

type StoredCreateRoleState = Partial<{
  flow: CreateRoleFlow;
  selectedTemplateId: RoleTemplateId | null;
  roleName: string;
  description: string;
  permissionGroups: PermissionGroup[];
  templateReturnTo: string | null;
}>;

function readStoredCreateRoleState(): StoredCreateRoleState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredCreateRoleState;
  } catch {
    return null;
  }
}

function createDefaultCreateRoleState() {
  const defaultId = 'branch-manager' as RoleTemplateId;
  const defaults = applyTemplateDefaults(defaultId);

  return {
    flow: 'create-role' as CreateRoleFlow,
    selectedTemplateId: defaultId,
    roleName: defaults.roleName,
    description: defaults.description,
    permissionCatalog: [],
    permissionGroups: [],
    templateReturnTo: null,
  };
}

function applyStoredCreateRoleState(
  stored: StoredCreateRoleState,
  setters: {
    setFlow: (flow: CreateRoleFlow) => void;
    setSelectedTemplateId: (id: RoleTemplateId | null) => void;
    setRoleName: (value: string) => void;
    setDescription: (value: string) => void;
    setPermissionGroups: (groups: PermissionGroup[]) => void;
    setTemplateReturnTo: (value: string | null) => void;
  },
) {
  if (stored.flow === 'create-template' || stored.flow === 'create-role') {
    setters.setFlow(stored.flow);
  }
  if (stored.selectedTemplateId !== undefined) {
    setters.setSelectedTemplateId(stored.selectedTemplateId);
  }
  if (stored.roleName !== undefined) {
    setters.setRoleName(stored.roleName);
  }
  if (stored.description !== undefined) {
    setters.setDescription(stored.description);
  }
  if (stored.permissionGroups) {
    setters.setPermissionGroups(stored.permissionGroups);
  }
  if (stored.templateReturnTo !== undefined) {
    setters.setTemplateReturnTo(stored.templateReturnTo);
  }
}

export function CreateRoleProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const level = useRoleManagementLevel();

  const [initial] = useState(createDefaultCreateRoleState);
  const [flow, setFlow] = useState<CreateRoleFlow>(initial.flow);
  const [selectedTemplateId, setSelectedTemplateId] = useState<RoleTemplateId | null>(
    initial.selectedTemplateId,
  );
  const [roleName, setRoleName] = useState(initial.roleName);
  const [description, setDescription] = useState(initial.description);
  const [permissionCatalog, setPermissionCatalogState] = useState<PermissionGroup[]>(
    initial.permissionCatalog,
  );
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    initial.permissionGroups,
  );
  const [templateReturnTo, setTemplateReturnTo] = useState<string | null>(initial.templateReturnTo);

  useEffect(() => {
    const stored = readStoredCreateRoleState();
    if (!stored) return;

    applyStoredCreateRoleState(stored, {
      setFlow,
      setSelectedTemplateId,
      setRoleName,
      setDescription,
      setPermissionGroups,
      setTemplateReturnTo,
    });
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          flow,
          selectedTemplateId,
          roleName,
          description,
          permissionGroups,
          templateReturnTo,
        }),
      );
    } catch {
      /* ignore quota / private mode */
    }
  }, [flow, selectedTemplateId, roleName, description, permissionGroups, templateReturnTo]);

  const selectTemplate = useCallback((id: RoleTemplateId | null) => {
    setFlow('create-role');
    setSelectedTemplateId(id);
    const template = getTemplateById(id);
    if (template) {
      const defaults = applyTemplateDefaults(id);
      setRoleName(defaults.roleName);
      setDescription(defaults.description);
    }
  }, []);

  const startCustomTemplate = useCallback(
    (returnTo: string) => {
      const roleNameValue = 'Custom role';
      const descriptionValue =
        'Assigned to custom restaurant branch supervisors with partial finance approval limits.';
      const groups = cloneCatalogGroups(permissionCatalog);

      setFlow('create-template');
      setTemplateReturnTo(returnTo);
      setSelectedTemplateId(null);
      setRoleName(roleNameValue);
      setDescription(descriptionValue);
      setPermissionGroups(groups);

      // Write immediately so a layout switch cannot drop the return path.
      try {
        const stored = readStoredCreateRoleState() ?? {};
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...stored,
            flow: 'create-template',
            templateReturnTo: returnTo,
            selectedTemplateId: null,
            roleName: roleNameValue,
            description: descriptionValue,
            permissionGroups: groups,
          }),
        );
      } catch {
        /* ignore quota / private mode */
      }
    },
    [permissionCatalog],
  );

  const effectiveTemplateId = useMemo(() => {
    if (
      flow !== 'create-template' &&
      selectedTemplateId != null &&
      canCreateRoleTemplate(level, selectedTemplateId)
    ) {
      return selectedTemplateId;
    }
    return flow !== 'create-template' ? getDefaultRoleTemplateId(level) : selectedTemplateId;
  }, [flow, selectedTemplateId, level]);

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

  const reset = useCallback(() => {
    const defaultId = getDefaultRoleTemplateId(level);
    setFlow('create-role');
    setTemplateReturnTo(null);
    setSelectedTemplateId(defaultId);
    const defaults = applyTemplateDefaults(defaultId);
    setRoleName(defaults.roleName || 'Branch Manager');
    setDescription(
      defaults.description || 'Manages staff and inventory at a specific branch level.',
    );
    setPermissionGroups(cloneCatalogGroups(permissionCatalog));
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [level, permissionCatalog]);

  const value = useMemo(
    () => ({
      flow,
      selectedTemplateId: effectiveTemplateId,
      roleName,
      description,
      permissionCatalog,
      permissionGroups,
      templateReturnTo,
      setFlow,
      setSelectedTemplateId: selectTemplate,
      startCustomTemplate,
      setRoleName,
      setDescription,
      setPermissionCatalog,
      setPermissionGroups: replacePermissionGroups,
      setPermissionEnabled,
      toggleAllInGroup,
      reset,
    }),
    [
      flow,
      effectiveTemplateId,
      roleName,
      description,
      permissionCatalog,
      permissionGroups,
      templateReturnTo,
      selectTemplate,
      startCustomTemplate,
      setPermissionCatalog,
      replacePermissionGroups,
      setPermissionEnabled,
      toggleAllInGroup,
      reset,
    ],
  );

  return <CreateRoleContext.Provider value={value}>{children}</CreateRoleContext.Provider>;
}

export function useCreateRole() {
  const ctx = useContext(CreateRoleContext);
  if (!ctx) throw new Error('useCreateRole must be used within CreateRoleProvider');
  return ctx;
}
