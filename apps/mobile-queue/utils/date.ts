export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatDateForApi = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

export const getDefaultSchedule = () => startOfDay(new Date());

export const getUpcomingSaturday = (date: Date) => {
  const day = date.getDay();
  if (day === 0) {
    // Sunday is already part of the current weekend
    return startOfDay(date);
  }
  const daysUntilSaturday = (6 - day + 7) % 7;
  return addDays(date, daysUntilSaturday);
};

export const getEndOfWeek = (date: Date) => {
  const day = date.getDay();
  const daysUntilSunday = (7 - day) % 7;
  return addDays(date, daysUntilSunday);
};

export const formatScheduleLabel = (
  date: Date | null,
  referenceDate: Date = getDefaultSchedule(),
) => {
  if (!date) return 'No schedule';

  const today = startOfDay(referenceDate);
  if (isSameDay(date, today)) return 'Today';

  const tomorrow = addDays(today, 1);
  if (isSameDay(date, tomorrow)) return 'Tomorrow';

  const thisWeek = getEndOfWeek(today);
  if (isSameDay(date, thisWeek)) return 'This Week';

  const nextWeek = addDays(today, 7);
  if (isSameDay(date, nextWeek)) return 'Next Week';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};
