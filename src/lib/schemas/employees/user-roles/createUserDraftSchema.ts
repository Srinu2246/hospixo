import { z } from 'zod';

import {
  DEFAULT_CREATE_USER_FORM_VALUES,
  createUserStepSchema,
  permissionCategorySchema,
  roleTemplateItemSchema,
  scopeTypeSchema,
  type CreateUserFormValues,
  type CreateUserStep,
  type PermissionCategory,
  type RoleTemplateItem,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';

export type CreateUserDraftSource = {
  scope: ScopeType;
  selectedTemplate: RoleTemplateItem | null;
  selectedRoleId: string | number | null;
  formValues: CreateUserFormValues;
  categories: PermissionCategory[];
};

const createUserDraftFormValuesSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  countryCode: z.string().optional(),
  phoneNumber: z.string(),
  email: z.string(),
  username: z.string(),
  password: z.string().optional(),
  company: z.string(),
  branch: z.string(),
  role: z.string(),
  sendInviteImmediately: z.boolean(),
  personalMessage: z.string(),
});

export const createUserDraftSchema = z.object({
  version: z.literal(1),
  scope: scopeTypeSchema,
  step: createUserStepSchema,
  selectedTemplate: roleTemplateItemSchema.nullable(),
  selectedRoleId: z.union([z.string(), z.number()]).nullable(),
  formValues: createUserDraftFormValuesSchema,
  categories: z.array(permissionCategorySchema),
  savedAt: z.number().int().nonnegative(),
});

export type CreateUserDraft = z.infer<typeof createUserDraftSchema>;

export type CreateUserDraftHydration = {
  scope: ScopeType;
  selectedTemplate: RoleTemplateItem | null;
  selectedRoleId: string | number | null;
  formValues: CreateUserFormValues;
  categories: PermissionCategory[];
};

/** Persist wizard state to localStorage (full form values, including password). */
export function trySerializeCreateUserDraft(
  state: CreateUserDraftSource,
  step: CreateUserStep,
): CreateUserDraft | null {
  const templateParsed = roleTemplateItemSchema.safeParse(state.selectedTemplate);
  const selectedTemplate = templateParsed.success ? templateParsed.data : null;

  const parsed = createUserDraftSchema.safeParse({
    version: 1,
    scope: state.scope,
    step,
    selectedTemplate,
    selectedRoleId: state.selectedRoleId,
    formValues: state.formValues,
    categories: state.categories,
    savedAt: Date.now(),
  });

  return parsed.success ? parsed.data : null;
}

export function toCreateUserDraftHydration(draft: CreateUserDraft): CreateUserDraftHydration {
  return {
    scope: draft.scope,
    selectedTemplate: draft.selectedTemplate,
    selectedRoleId: draft.selectedRoleId,
    formValues: {
      ...draft.formValues,
      password: draft.formValues.password ?? '',
      countryCode: draft.formValues.countryCode ?? DEFAULT_CREATE_USER_FORM_VALUES.countryCode,
    },
    categories: draft.categories,
  };
}
