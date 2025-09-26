import { addDays, endOfWeek, format, isSameDay, startOfDay } from 'date-fns';

const API_DATE_FORMAT = 'yyyy-MM-dd';
const SCHEDULE_DISPLAY_FORMAT = 'eee, MMMM d, yyyy';

export const normalizeToStartOfDay = (date: Date) => startOfDay(date);

export const getDefaultSchedule = () => normalizeToStartOfDay(new Date());

export const getTomorrowPreset = (reference: Date) => normalizeToStartOfDay(addDays(reference, 1));

export const getEndOfCurrentWeek = (reference: Date) => normalizeToStartOfDay(endOfWeek(reference));

export const getNextWeekPreset = (reference: Date) => normalizeToStartOfDay(addDays(reference, 7));

export const formatDateForApi = (date: Date) => format(date, API_DATE_FORMAT);

export const formatScheduleLabel = (
  date: Date | null,
  referenceDate: Date = getDefaultSchedule(),
) => {
  if (!date) return 'No schedule';

  const today = normalizeToStartOfDay(referenceDate);
  if (isSameDay(date, today)) return 'Today';

  const tomorrow = getTomorrowPreset(today);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';

  const thisWeekEnd = getEndOfCurrentWeek(today);
  if (isSameDay(date, thisWeekEnd)) return 'This Week';

  const nextWeek = getNextWeekPreset(today);
  if (isSameDay(date, nextWeek)) return 'Next Week';

  return format(date, SCHEDULE_DISPLAY_FORMAT);
};

export const isSameDayPreset = (first: Date, second: Date) => isSameDay(first, second);
