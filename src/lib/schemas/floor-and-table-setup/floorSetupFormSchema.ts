import { z } from 'zod';

export const floorFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a floor name.'),
  code: z.string(),
  description: z.string(),
  active: z.boolean(),
});

export type FloorFormValues = z.infer<typeof floorFormSchema>;

export const sectionFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter a section name.'),
  code: z.string(),
  description: z.string(),
  active: z.boolean(),
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;

export const tableFormSchema = z.object({
  number: z.string().trim().min(1, 'Enter a table number.'),
  seats: z.number().int().min(1, 'Enter a capacity of at least 1.'),
  sectionId: z.string().trim().min(1, 'Select a section.'),
  active: z.boolean(),
  reservations: z.boolean(),
});

export type TableFormValues = z.infer<typeof tableFormSchema>;

export type SetupFormMode = 'add' | 'edit';

/** Add can save once required fields are valid. Edit can save only after a change that stays valid. */
export function canSubmitSetupForm(
  mode: SetupFormMode,
  formState: { isValid: boolean; isDirty: boolean },
): boolean {
  if (mode === 'edit') return formState.isDirty && formState.isValid;
  return formState.isValid;
}
