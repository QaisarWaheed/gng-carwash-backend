const DUBAI_TIMEZONE = 'Asia/Dubai';
const DUBAI_UTC_OFFSET = 4; // UTC+4

export function getDubaiNow(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: DUBAI_TIMEZONE }),
  );
}

export function toDubaiTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Date(
    dateObj.toLocaleString('en-US', { timeZone: DUBAI_TIMEZONE }),
  );
}

export function getDubaiDayStart(date: Date | string): Date {
  const dubaiDate = toDubaiTime(date);
  dubaiDate.setHours(0, 0, 0, 0);
  return dubaiDate;
}

export function getDubaiDayEnd(date: Date | string): Date {
  const dubaiDate = toDubaiTime(date);
  dubaiDate.setHours(23, 59, 59, 999);
  return dubaiDate;
}

export function isSameDubaiDay(
  date1: Date | string,
  date2: Date | string,
): boolean {
  const d1 = toDubaiTime(date1);
  const d2 = toDubaiTime(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getDubaiDateString(date: Date | string): string {
  const dubaiDate = toDubaiTime(date);
  const year = dubaiDate.getFullYear();
  const month = String(dubaiDate.getMonth() + 1).padStart(2, '0');
  const day = String(dubaiDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDubaiDate(date: Date | string): string {
  const dubaiDate = toDubaiTime(date);
  return dubaiDate.toLocaleDateString('en-AE', {
    timeZone: DUBAI_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDubaiDateTime(date: Date | string): string {
  const dubaiDate = toDubaiTime(date);
  return dubaiDate.toLocaleString('en-AE', {
    timeZone: DUBAI_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isPastDubaiDate(date: Date | string): boolean {
  const dubaiDate = getDubaiDayStart(date);
  const dubaiNow = getDubaiDayStart(getDubaiNow());
  return dubaiDate < dubaiNow;
}

export function isDubaiToday(date: Date | string): boolean {
  return isSameDubaiDay(date, getDubaiNow());
}

export function getDubaiTimezoneInfo() {
  return {
    timezone: DUBAI_TIMEZONE,
    offset: `UTC+${DUBAI_UTC_OFFSET}`,
    abbreviation: 'GST',
    fullName: 'Gulf Standard Time',
  };
}
