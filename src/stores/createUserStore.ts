import { create } from 'zustand';
import type {
  CreateUserStep,
  CreateUserFormValues,
  RoleTemplateItem,
  PermissionCategory,
} from '@/features/employees/user-roles/types/multiform.types';
import {
  INITIAL_USER_FORM_VALUES,
  INITIAL_PERMISSION_CATEGORIES,
} from '@/lib/mocks/employees/multiform.mocks';

export interface CreateUserState {
  step: CreateUserStep;
  selectedTemplate: RoleTemplateItem | null;
  formValues: CreateUserFormValues;
  categories: PermissionCategory[];
  errors: Partial<Record<keyof CreateUserFormValues, string>>;
  isSubmitting: boolean;

  setStep: (step: CreateUserStep) => void;
  setSelectedTemplate: (template: RoleTemplateItem | null) => void;
  setFormValues: (values: Partial<CreateUserFormValues>) => void;
  updateFormField: (field: keyof CreateUserFormValues, value: string | boolean) => void;
  setErrors: (errors: Partial<Record<keyof CreateUserFormValues, string>>) => void;
  clearError: (field: keyof CreateUserFormValues) => void;
  setCategories: (categories: PermissionCategory[]) => void;
  togglePermission: (categoryId: string, permissionId: string) => void;
  toggleCategoryAll: (categoryId: string, enableAll: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  reset: () => void;
}

export const useCreateUserStore = create<CreateUserState>((set) => ({
  step: 'template',
  selectedTemplate: null,
  formValues: { ...INITIAL_USER_FORM_VALUES },
  categories: INITIAL_PERMISSION_CATEGORIES,
  errors: {},
  isSubmitting: false,

  setStep: (step) => set({ step }),

  setSelectedTemplate: (template) =>
    set((state) => ({
      selectedTemplate: template,
      formValues: {
        ...state.formValues,
        role: template?.roleName || state.formValues.role || 'Branch Manager',
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

  clearError: (field) =>
    set((state) => ({
      errors: { ...state.errors, [field]: undefined },
    })),

  setCategories: (categories) => set({ categories }),

  togglePermission: (categoryId, permissionId) =>
    set((state) => ({
      categories: state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          permissions: cat.permissions.map((p) =>
            p.id === permissionId ? { ...p, enabled: !p.enabled } : p,
          ),
        };
      }),
    })),

  toggleCategoryAll: (categoryId, enableAll) =>
    set((state) => ({
      categories: state.categories.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          permissions: cat.permissions.map((p) => ({ ...p, enabled: enableAll })),
        };
      }),
    })),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  reset: () =>
    set({
      step: 'template',
      selectedTemplate: null,
      formValues: { ...INITIAL_USER_FORM_VALUES },
      categories: INITIAL_PERMISSION_CATEGORIES,
      errors: {},
      isSubmitting: false,
    }),
}));
