export type ModifierGroupId = string;
export type ModifierOptionId = string;

export type ModifierGroupStatus = 'active' | 'inactive';

export type ModifierGroupApi = Readonly<{
  id: number;
  organization_id?: number;
  company_id?: number;
  name: string;
  min_select: number;
  max_select: number;
  is_required: boolean;
  status?: ModifierGroupStatus | string;
  created_at?: string;
  updated_at?: string;
}>;

export type ModifierOptionApi = Readonly<{
  id: number;
  modifier_group_id?: number;
  name: string;
  price_delta: number;
  display_order: number;
  status?: ModifierGroupStatus | string;
  created_at?: string;
  updated_at?: string;
}>;

export type CreateModifierGroupApiRequest = Readonly<{
  name: string;
  min_select?: number;
  max_select?: number;
  is_required?: boolean;
}>;

export type UpdateModifierGroupApiRequest = Readonly<{
  name?: string;
  min_select?: number;
  max_select?: number;
  is_required?: boolean;
  status?: ModifierGroupStatus;
}>;

export type CreateModifierOptionApiRequest = Readonly<{
  name: string;
  price_delta?: number;
  display_order?: number;
}>;

export type UpdateModifierOptionApiRequest = Readonly<{
  name?: string;
  price_delta?: number;
  display_order?: number;
  status?: ModifierGroupStatus;
}>;

export type ListModifierGroupsApiQuery = Readonly<{
  status?: ModifierGroupStatus;
}>;

export type ListModifierOptionsApiQuery = Readonly<{
  status?: ModifierGroupStatus;
}>;
