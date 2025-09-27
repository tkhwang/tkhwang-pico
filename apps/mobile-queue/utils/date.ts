import { addDays, endOfWeek, format, isSameDay, startOfDay } from 'date-fns';

const API_DATE_FORMAT = 'yyyy-MM-dd';
const SCHEDULE_DISPLAY_FORMAT = 'eee, MMMM d, yyyy';
const DISPLAY_DATE_FORMAT = 'MMM d, yyyy';
const DISPLAY_DATETIME_FORMAT = 'MMM d, yyyy h:mm a';

export function normalizeToStartOfDay(date: Date) {
  return startOfDay(date);
}

export function getDefaultSchedule() {
  return normalizeToStartOfDay(new Date());
}

export function getTomorrowPreset(reference: Date) {
  return normalizeToStartOfDay(addDays(reference, 1));
}

export function getEndOfCurrentWeek(reference: Date) {
  return normalizeToStartOfDay(endOfWeek(reference));
}

export function getNextWeekPreset(reference: Date) {
  return normalizeToStartOfDay(addDays(reference, 7));
}

export function formatDateForApi(date: Date) {
  return format(date, API_DATE_FORMAT);
}

export function formatScheduleLabel(date: Date | null, referenceDate: Date = getDefaultSchedule()) {
  if (!date) return 'No schedule';

  const today = normalizeToStartOfDay(referenceDate);
  if (isSameDay(date, today)) return 'Today';

  const tomorrow = getTomorrowPreset(today);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';

  const thisWeekEnd = getEndOfCurrentWeek(today);
  if (isSameDay(date, thisWeekEnd)) return 'This Weekend';

  const nextWeek = getNextWeekPreset(today);
  if (isSameDay(date, nextWeek)) return 'Next Week';

  return format(date, SCHEDULE_DISPLAY_FORMAT);
}

export function isSameDayPreset(first: Date, second: Date) {
  return isSameDay(first, second);
}

function toDateOrNull(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function formatScheduledDate(scheduledFor?: string | null): string {
  const date = toDateOrNull(scheduledFor);
  if (!date) return '—';
  return format(date, DISPLAY_DATE_FORMAT);
}

export function formatCompletedDate(completedAt?: string | null): string {
  const date = toDateOrNull(completedAt);
  if (!date) return '—';
  return format(date, DISPLAY_DATETIME_FORMAT);
}

export function formatSavedDate(savedAt?: string | null): string {
  const date = toDateOrNull(savedAt);
  if (!date) return '—';
  return format(date, DISPLAY_DATETIME_FORMAT);
}
