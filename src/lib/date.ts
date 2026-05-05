import {
  format,
  formatDistanceToNow,
  parseISO,
  isToday,
  isTomorrow,
  isYesterday,
  isBefore,
  isAfter,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isValid,
} from 'date-fns';

/** Parse a date string (ISO or date-only) into a Date object */
export function parseDate(dateStr: string): Date {
  if (dateStr.includes('T')) {
    return parseISO(dateStr);
  }
  // date-only: interpret as local date to avoid UTC offset issues
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format a date for display (e.g. "Jul 10, 2026") */
export function formatDate(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, 'MMM d, yyyy');
}

/** Format a date range for display */
export function formatDateRange(startStr: string | null, endStr: string | null): string {
  if (!startStr && !endStr) return 'Dates TBD';
  if (!endStr) return formatDate(startStr!);
  if (!startStr) return `Until ${formatDate(endStr)}`;

  const start = parseDate(startStr);
  const end = parseDate(endStr);

  if (format(start, 'yyyy-MM') === format(end, 'yyyy-MM')) {
    return `${format(start, 'MMM d')}–${format(end, 'd, yyyy')}`;
  }
  if (format(start, 'yyyy') === format(end, 'yyyy')) {
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return `${formatDate(startStr)} – ${formatDate(endStr)}`;
}

/** Format a time string (HH:mm:ss) for display */
export function formatTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return format(d, 'h:mm a');
}

/** Relative time: "2 hours ago", "in 3 days" */
export function relativeTime(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!isValid(d)) return dateStr;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Friendly day label: "Today", "Tomorrow", "Yesterday", or formatted date */
export function friendlyDay(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!isValid(d)) return dateStr;
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEE, MMM d');
}

/** Format for day grouping headers in lists */
export function formatDayHeader(dateStr: string): string {
  const d = parseDate(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, 'EEEE, MMMM d');
}

/** Get all dates in a trip's range */
export function getTripDays(startStr: string, endStr: string): string[] {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  if (!isValid(start) || !isValid(end)) return [];
  return eachDayOfInterval({ start, end }).map((d) => format(d, 'yyyy-MM-dd'));
}

export {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isYesterday,
  isBefore,
  isAfter,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  isValid,
};
