const EPOCH_OFFSET = 719_468;

function daysFromCivil(year: number, month: number, day: number): number {
  const adjustedYear = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(adjustedYear / 400);
  const yearOfEra = adjustedYear - era * 400;
  const adjustedMonth = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * adjustedMonth + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146_097 + dayOfEra - EPOCH_OFFSET;
}

export function civilFromDays(days: number): string {
  const shiftedDays = days + EPOCH_OFFSET;
  const era = Math.floor(shiftedDays / 146_097);
  const dayOfEra = shiftedDays - era * 146_097;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1_460) +
      Math.floor(dayOfEra / 36_524) -
      Math.floor(dayOfEra / 146_096)) /
      365,
  );
  let year = yearOfEra + era * 400;
  const dayOfYear =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const monthPrime = Math.floor((5 * dayOfYear + 2) / 153);
  const day = dayOfYear - Math.floor((153 * monthPrime + 2) / 5) + 1;
  const month = monthPrime + (monthPrime < 10 ? 3 : -9);
  year += month <= 2 ? 1 : 0;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDate(text: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (match === null) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1970 || year > 2200 || month < 1 || month > 12) return null;
  const serial = daysFromCivil(year, month, day);
  return civilFromDays(serial) === text ? serial : null;
}

export function workdayCalendar(start: string, holidays: string[]): (index: number) => string {
  const startDay = parseDate(start);
  if (startDay === null) throw new RangeError("Invalid calendar start date");
  const holidayDays = new Set<number>();
  for (const holiday of holidays) {
    const day = parseDate(holiday);
    if (day !== null) holidayDays.add(day);
  }

  const workingDays: number[] = [];
  let candidate = startDay;
  const isWorkingDay = (day: number): boolean => {
    const weekday = (((day + 4) % 7) + 7) % 7;
    return weekday !== 0 && weekday !== 6 && !holidayDays.has(day);
  };
  while (!isWorkingDay(candidate)) candidate += 1;
  workingDays.push(candidate);

  return (index: number): string => {
    if (!Number.isInteger(index) || index < 0) throw new RangeError("Invalid working-day index");
    while (workingDays.length <= index) {
      candidate = (workingDays[workingDays.length - 1] ?? candidate) + 1;
      while (!isWorkingDay(candidate)) candidate += 1;
      workingDays.push(candidate);
    }
    const day = workingDays[index];
    if (day === undefined) throw new RangeError("Invalid working-day index");
    return civilFromDays(day);
  };
}
