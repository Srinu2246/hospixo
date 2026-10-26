import type {
  CreateMealSessionBody,
  MealSession,
} from '@/lib/schemas/menu/sessions/mealSessionsSchema';
import {
  SESSION_NAME_OPTIONS,
  sessionNameSchema,
  type SessionFormValues,
  type SessionName,
  type SessionRecord,
} from '@/lib/schemas/menu/sessions/sessionSchema';

const FORM_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Human-readable label for API session name codes. */
export function formatSessionNameLabel(name: string): string {
  const normalized = name.trim().toLowerCase();
  const option = SESSION_NAME_OPTIONS.find((entry) => entry.id === normalized);
  if (option) return option.label;
  if (!name.trim()) return 'Session';
  return name.trim();
}

/** Map stored/API session name to form dropdown value. */
export function parseSessionNameForForm(name: string | null | undefined): SessionName | '' {
  if (!name?.trim()) return '';
  const parsed = sessionNameSchema.safeParse(name.trim().toLowerCase());
  return parsed.success ? parsed.data : '';
}

/** 24-hour `HH:mm` for form time inputs. */
export function isMealSessionFormTime(value: string): boolean {
  return FORM_TIME_PATTERN.test(value.trim());
}

/** API time string → `HH:mm` for `<input type="time" />`. */
export function mealSessionTimeToFormValue(value: string | null | undefined): string {
  if (!value?.trim()) return '06:00';

  const trimmed = value.trim();

  const apiMatch = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (apiMatch && !trimmed.includes('T')) {
    const hours = Number(apiMatch[1]);
    const minutes = Number(apiMatch[2]);
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  if (trimmed.includes('T')) {
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  }

  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2]);
    const meridiem = twelveHour[3].toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  return '06:00';
}

/** Form `HH:mm` → API `HH:MM:SS` (time-of-day, not ISO datetime). */
export function formTimeToApiMealSessionTime(hhmm: string): string {
  const trimmed = hhmm.trim();
  if (!isMealSessionFormTime(trimmed)) {
    throw new Error('Select a valid start and end time.');
  }
  const [hours, minutes] = trimmed.split(':');
  return `${hours}:${minutes}:00`;
}

/** 24-hour display label (`HH:mm`) for API time strings. */
export function formatMealSessionTimeForDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  return mealSessionTimeToFormValue(value);
}

function formatRelativeUpdatedAt(updatedAt: string | null | undefined): string {
  if (!updatedAt?.trim()) return 'Updated recently';
  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) return 'Updated recently';
  const diffMs = Date.now() - parsed;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Updated just now';
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
}

export function mealSessionToSessionRecord(session: MealSession): SessionRecord {
  return {
    id: String(session.id),
    name: session.name,
    startTime: formatMealSessionTimeForDisplay(session.start_time),
    endTime: formatMealSessionTimeForDisplay(session.end_time),
    status: session.is_active === false ? 'inactive' : 'active',
    updatedAt: formatRelativeUpdatedAt(session.updated_at),
  };
}

function sessionFormToMealSessionWriteBody(values: SessionFormValues): CreateMealSessionBody {
  return {
    name: values.name,
    start_time: formTimeToApiMealSessionTime(values.startTime),
    end_time: formTimeToApiMealSessionTime(values.endTime),
    is_active: values.status === 'active',
  };
}

/** POST /v1/branches/{branch_id}/meal-sessions */
export function sessionFormToCreateMealSessionBody(
  values: SessionFormValues,
): CreateMealSessionBody {
  return sessionFormToMealSessionWriteBody(values);
}

/** PATCH /v1/branches/{branch_id}/meal-sessions/{session_id} */
export function sessionFormToUpdateMealSessionBody(
  values: SessionFormValues,
): CreateMealSessionBody {
  return sessionFormToMealSessionWriteBody(values);
}
