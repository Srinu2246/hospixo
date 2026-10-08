'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { ModifierGroupsPageConfig } from '../config/modifier-groups-page-config';
import {
  createModifierOptionClient,
  fetchModifierGroupByIdClient,
  fetchModifierOptionsClient,
  updateModifierOptionClient,
} from '../api/modifier-groups';
import {
  useCreateModifierGroupMutation,
  useModifierGroupsListQuery,
  useUpdateModifierGroupMutation,
} from '../hooks/use-modifier-groups-query';
import type {
  CreateModifierGroupInput,
  CreateModifierOptionInput,
  ModifierGroup,
  ModifierGroupsViewMode,
  ModifierOption,
  UpdateModifierGroupInput,
  UpdateModifierOptionInput,
} from '../types/modifier-group';
import type {
  ModifierGroupId,
  ModifierGroupStatus,
  ModifierOptionId,
} from '../types/modifier-group-api';

type ModifierGroupsContextType = {
  pageConfig: ModifierGroupsPageConfig;
  groups: ModifierGroup[];
  selectedGroup: ModifierGroup | null;
  options: ModifierOption[];
  viewMode: ModifierGroupsViewMode;
  statusFilter: ModifierGroupStatus | 'all';
  isHydrated: boolean;
  groupsLoading: boolean;
  groupsError: string | null;
  detailLoading: boolean;
  detailError: string | null;
  optionsLoading: boolean;
  optionsError: string | null;

  setStatusFilter: (status: ModifierGroupStatus | 'all') => void;
  openCreateGroupPage: () => void;
  openViewGroupPage: (group: ModifierGroup) => void;
  openEditGroupPage: (group?: ModifierGroup) => void;
  backToList: () => void;

  createGroup: (input: CreateModifierGroupInput) => Promise<{ ok: boolean; message?: string }>;
  updateGroup: (
    groupId: ModifierGroupId,
    input: UpdateModifierGroupInput,
  ) => Promise<{ ok: boolean; message?: string }>;
  loadGroupDetail: (groupId: ModifierGroupId) => Promise<{ ok: boolean; message?: string }>;
  loadGroupOptions: (groupId: ModifierGroupId) => Promise<{ ok: boolean; message?: string }>;
  createOption: (
    groupId: ModifierGroupId,
    input: CreateModifierOptionInput,
  ) => Promise<{ ok: boolean; message?: string }>;
  updateOption: (
    groupId: ModifierGroupId,
    optionId: ModifierOptionId,
    input: UpdateModifierOptionInput,
  ) => Promise<{ ok: boolean; message?: string }>;
};

const ModifierGroupsContext = createContext<ModifierGroupsContextType | null>(null);

export function ModifierGroupsProvider({
  children,
  pageConfig,
}: {
  children: ReactNode;
  pageConfig: ModifierGroupsPageConfig;
}) {
  const [selectedGroup, setSelectedGroup] = useState<ModifierGroup | null>(null);
  const [options, setOptions] = useState<ModifierOption[]>([]);
  const [viewMode, setViewMode] = useState<ModifierGroupsViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<ModifierGroupStatus | 'all'>('all');
  const createGroupMutation = useCreateModifierGroupMutation();
  const updateGroupMutation = useUpdateModifierGroupMutation();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const listQuery = useMemo(() => {
    if (statusFilter === 'all') return undefined;
    return { status: statusFilter };
  }, [statusFilter]);

  const groupsQuery = useModifierGroupsListQuery(listQuery);
  const groups = groupsQuery.data ?? [];
  const groupsLoading = groupsQuery.isPending;
  const groupsError = groupsQuery.error instanceof Error ? groupsQuery.error.message : null;
  const isHydrated = groupsQuery.isFetched;

  const openCreateGroupPage = useCallback(() => {
    setViewMode('create-group');
  }, []);

  const openViewGroupPage = useCallback((group: ModifierGroup) => {
    setSelectedGroup(group);
    setViewMode('view-group');
    setDetailLoading(false);
    setDetailError(null);
  }, []);

  const openEditGroupPage = useCallback((group?: ModifierGroup) => {
    if (group) setSelectedGroup(group);
    setViewMode('edit-group');
  }, []);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedGroup(null);
    setDetailError(null);
    setDetailLoading(false);
    setOptions([]);
    setOptionsError(null);
  }, []);

  const createGroup = useCallback(
    async (input: CreateModifierGroupInput) => {
      try {
        await createGroupMutation.mutateAsync(input);
        backToList();
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create modifier group';
        return { ok: false, message };
      }
    },
    [backToList, createGroupMutation],
  );

  const updateGroup = useCallback(
    async (groupId: ModifierGroupId, input: UpdateModifierGroupInput) => {
      try {
        const updated = await updateGroupMutation.mutateAsync({ groupId, input });
        setSelectedGroup((prev) => (prev?.id === groupId ? updated : prev));
        backToList();
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update modifier group';
        return { ok: false, message };
      }
    },
    [backToList, updateGroupMutation],
  );

  const loadGroupDetail = useCallback(async (groupId: ModifierGroupId) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await fetchModifierGroupByIdClient(groupId);
      if (data) {
        setSelectedGroup(data);
        return { ok: true };
      }
      return { ok: false, message: 'Group not found' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load details';
      setDetailError(message);
      return { ok: false, message };
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadGroupOptions = useCallback(async (groupId: ModifierGroupId) => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const data = await fetchModifierOptionsClient(groupId);
      setOptions(data);
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load options';
      setOptionsError(message);
      return { ok: false, message };
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const createOption = useCallback(
    async (groupId: ModifierGroupId, input: CreateModifierOptionInput) => {
      try {
        const created = await createModifierOptionClient(groupId, input);
        setOptions((prev) => [...prev, created]);
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create option';
        return { ok: false, message };
      }
    },
    [],
  );

  const updateOption = useCallback(
    async (
      groupId: ModifierGroupId,
      optionId: ModifierOptionId,
      input: UpdateModifierOptionInput,
    ) => {
      try {
        const updated = await updateModifierOptionClient(groupId, optionId, input);
        setOptions((prev) => prev.map((opt) => (opt.id === optionId ? updated : opt)));
        return { ok: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update option';
        return { ok: false, message };
      }
    },
    [],
  );

  const value: ModifierGroupsContextType = {
    pageConfig,
    groups,
    selectedGroup,
    options,
    viewMode,
    statusFilter,
    isHydrated,
    groupsLoading,
    groupsError,
    detailLoading,
    detailError,
    optionsLoading,
    optionsError,
    setStatusFilter,
    openCreateGroupPage,
    openViewGroupPage,
    openEditGroupPage,
    backToList,
    createGroup,
    updateGroup,
    loadGroupDetail,
    loadGroupOptions,
    createOption,
    updateOption,
  };

  return <ModifierGroupsContext.Provider value={value}>{children}</ModifierGroupsContext.Provider>;
}

export function useModifierGroups() {
  const context = useContext(ModifierGroupsContext);
  if (!context) {
    throw new Error('useModifierGroups must be used within ModifierGroupsProvider');
  }
  return context;
}
