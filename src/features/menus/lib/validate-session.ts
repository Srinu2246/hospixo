import { menusCopy } from '../config/copy';
import type { MenuSessionForm } from '../types/menus';

export function slugifySessionCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateMenuSessionForm(
  form: MenuSessionForm,
  existingCodes: readonly string[],
  currentId?: string,
): string | null {
  if (!form.name.trim()) return menusCopy.errors.nameRequired;
  if (!form.code.trim()) return menusCopy.errors.codeRequired;
  if (!form.menuType) return menusCopy.errors.typeRequired;

  const slug = slugifySessionCode(form.code);
  const taken = existingCodes.some((code) => slugifySessionCode(code) === slug);
  if (taken && slug !== currentId) {
    return menusCopy.errors.codeTaken;
  }

  return null;
}
