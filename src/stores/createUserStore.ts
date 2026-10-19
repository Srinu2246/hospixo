import { create } from 'zustand';
import {
  DEFAULT_CREATE_USER_FORM_VALUES,
  type CreateUserStep,
  type CreateUserFormValues,
  type RoleTemplateItem,
  type PermissionCategory,
  type ScopeType,
} from '@/lib/schemas/employees/user-roles/userRolesSchema';
import {
  togglePermissionCategory,
  toggleAllInCategory,
} from '@/lib/helpers/employees/userRolesHelpers';

export interface CreateUserState {
  scope: ScopeType;
  step: CreateUserStep;
  selectedTemplate: RoleTemplateItem | null;
  selectedRoleId: string | number | null;
  formValues: CreateUserFormValues;
  categories: PermissionCategory[];
  errors: Partial<Record<keyof CreateUserFormValues, string>>;
  isSubmitting: boolean;

  setScope: (scope: ScopeType) => void;
  setStep: (step: CreateUserStep) => void;
  setSelectedTemplate: (template: RoleTemplateItem | null) => void;
  setSelectedRoleId: (id: string | number | null) => void;
  setRoleAndDescription: (role: string, description: string, roleId?: string | number) => void;
  setFormValues: (values: Partial<CreateUserFormValues>) => void;
  updateFormField: (field: keyof CreateUserFormValues, value: string | boolean) => void;
  setErrors: (errors: Partial<Record<keyof CreateUserFormValues, string>>) => void;
  clearError: (field: keyof CreateUserFormValues) => void;
  setCategories: (
    categories: PermissionCategory[] | ((prev: PermissionCategory[]) => PermissionCategory[]),
  ) => void;
  togglePermission: (categoryId: string, permissionId: string) => void;
  toggleCategoryAll: (categoryId: string, enableAll: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: (newScope?: ScopeType) => void;
}

export const useCreateUserStore = create<CreateUserState>((set) => ({
  scope: 'company',
  step: 'template',
  selectedTemplate: null,
  selectedRoleId: null,
  formValues: { ...DEFAULT_CREATE_USER_FORM_VALUES },
  categories: [],
  errors: {},
  isSubmitting: false,

  setScope: (scope) => set({ scope }),

  setStep: (step) => set({ step }),

  setSelectedRoleId: (selectedRoleId) => set({ selectedRoleId }),

  setSelectedTemplate: (template) =>
    set((state) => ({
      selectedTemplate: template,
      selectedRoleId: template?.id != null ? template.id : state.selectedRoleId,
      formValues: {
        ...state.formValues,
        role: template?.roleName || state.formValues.role || 'Branch Admin',
      },
    })),

  setRoleAndDescription: (role, description, roleId) =>
    set((state) => ({
      selectedRoleId: roleId !== undefined ? roleId : state.selectedRoleId,
      formValues: {
        ...state.formValues,
        role,
      },
      selectedTemplate: state.selectedTemplate
        ? {
            ...state.selectedTemplate,
            roleName: role,
            description,
            ...(roleId !== undefined ? { id: String(roleId) } : {}),
          }
        : {
            id: roleId !== undefined ? String(roleId) : 'custom-role',
            title: role,
            description,
            icon: 'restaurant',
            roleName: role,
          },
    })),

  setFormValues: (values) =>
    set((state) => ({
      formValues: { ...state.formValues, ...values },
    })),

  updateFormField: (field, value) =>
    set((state) => ({
      formValues: { ...state.formValues, [field]: value },
      errors: state.errors[field] ? { ...state.errors, [field]: undefined } : state.errors,
    })),

  setErrors: (errors) => set({ errors }),

  clearError: (field: keyof CreateUserFormValues) =>
    set((state) => ({
      errors: { ...state.errors, [field]: undefined },
    })),

  setCategories: (categories) =>
    set((state) => ({
      categories: typeof categories === 'function' ? categories(state.categories) : categories,
    })),

  togglePermission: (categoryId, permissionId) =>
    set((state) => ({
      categories: togglePermissionCategory(state.categories, categoryId, permissionId),
    })),

  toggleCategoryAll: (categoryId, enableAll) =>
    set((state) => ({
      categories: toggleAllInCategory(state.categories, categoryId, enableAll),
    })),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  reset: (newScope) =>
    set((state) => {
      const scopeToUse = newScope || state.scope;
      return {
        scope: scopeToUse,
        step: 'template',
        selectedTemplate: null,
        selectedRoleId: null,
        formValues: {
          ...DEFAULT_CREATE_USER_FORM_VALUES,
          branch:
            scopeToUse === 'branch' ? 'Downtown Branch' : DEFAULT_CREATE_USER_FORM_VALUES.branch,
          role: scopeToUse === 'branch' ? 'Captain' : DEFAULT_CREATE_USER_FORM_VALUES.role,
        },
        categories: [],
        errors: {},
        isSubmitting: false,
      };
    }),
}));
