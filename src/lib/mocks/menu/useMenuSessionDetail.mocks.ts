/** Display schedule copy for meal sessions until the API exposes hours. */
export const MENU_SESSION_SCHEDULE_BY_CODE: Record<string, string> = {
  BKFAST: '07:00 AM – 11:00 AM | Mon–Sun',
  DEFAULT: 'All day | Mon–Sun',
  LUNCH: '12:00 PM – 03:00 PM | Mon–Sun',
  DINNER: '07:00 PM – 11:00 PM | Mon–Sun',
};

export function menuSessionScheduleLabel(code: string | null | undefined, name: string): string {
  const key = (code ?? '').toUpperCase();
  if (key && MENU_SESSION_SCHEDULE_BY_CODE[key]) return MENU_SESSION_SCHEDULE_BY_CODE[key];

  const lower = name.toLowerCase();
  if (lower.includes('breakfast')) return MENU_SESSION_SCHEDULE_BY_CODE.BKFAST;
  if (lower.includes('lunch')) return MENU_SESSION_SCHEDULE_BY_CODE.LUNCH;
  if (lower.includes('dinner')) return MENU_SESSION_SCHEDULE_BY_CODE.DINNER;
  return 'Session hours not set';
}

export type MenuSessionAssignedItem = {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  basePrice: number;
  dietary: 'Veg' | 'Non-Veg' | 'Egg' | 'Vegan';
  orderTypes: string;
  imageUrl?: string;
};
