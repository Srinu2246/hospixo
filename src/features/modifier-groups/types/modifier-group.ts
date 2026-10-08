import type { ModifierGroupStatus } from './modifier-group-api';

export type ModifierGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  status?: ModifierGroupStatus | string;
  createdAt?: string;
  updatedAt?: string;
};

export type ModifierOption = {
  id: string;
  groupId: string;
  name: string;
  priceDelta: number;
  displayOrder: number;
  status?: ModifierGroupStatus | string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateModifierGroupInput = {
  name: string;
  minSelect?: number;
  maxSelect?: number;
  isRequired?: boolean;
};

export type UpdateModifierGroupInput = {
  name?: string;
  minSelect?: number;
  maxSelect?: number;
  isRequired?: boolean;
  status?: ModifierGroupStatus;
};

export type CreateModifierOptionInput = {
  name: string;
  priceDelta?: number;
  displayOrder?: number;
};

export type UpdateModifierOptionInput = {
  name?: string;
  priceDelta?: number;
  displayOrder?: number;
  status?: ModifierGroupStatus;
};

export type ModifierGroupsViewMode = 'list' | 'create-group' | 'view-group' | 'edit-group';
