import {
  endOfDay,
  isBefore,
  isAfter,
  isSameDay as dfIsSameDay,
  startOfDay, subDays, addDays
} from 'date-fns';

export type DateComparisonFunction = (d1: Date, d2: Date) => boolean;

/**
 * Determines if date 1 describes a calendar day that is before date 2, considering only the calendar day of
 * the supplied dates (time of day is discarded when performing this assessment).
 */
export const isBeforeDay: DateComparisonFunction = (d1: Date, d2: Date) => {
  /* Short circuit - if either d1 or d2 is not a Date object, return false, as we cannot perform an assessment. */
  /* Otherwise, normalize the dates and perform an isBefore operation. */
  return !d1 || !d2 ? false : isBefore(startOfDay(d1), startOfDay(d2));
};

/**
 * Determines if date 1 describes a calendar day that is after date 2, considering only the calendar day of
 * the supplied dates (time of day is discarded when performing this assessment).
 */
export const isAfterDay: DateComparisonFunction = (d1: Date, d2: Date) => {
  /* Short circuit - if either d1 or d2 is not a Date object, return false, as we cannot perform an assessment. */
  /* Otherwise, normalize the dates and perform an isAfter operation. */
  return !d1 || !d2 ? false : isAfter(endOfDay(d1), endOfDay(d2));
};

/**
 * Determines if date 1 describes a calendar day that is the same as date 2, considering only the calendar day of
 * the supplied dates (time of day is discarded when performing this assessment).
 */
export const isSameDay: DateComparisonFunction = (d1: Date, d2: Date) => {
  /* Short circuit - if either d1 or d2 is not a Date object, return false, as we cannot perform an assessment. */
  /* Otherwise, perform an isAfter operation. */
  return !d1 || !d2 ? false : dfIsSameDay(d1, d2);
};

export const isToday = (date: Date) => {
  return isSameDay(date, new Date());
};

export const isYesterday = (date: Date) => {
  return isSameDay(date, subDays(new Date(), 1));
};

export const isTomorrow = (date: Date) => {
  return isSameDay(date, addDays(new Date(), 1));
};

export enum DateGranularity {
  year,
  month,
  day,
  hour,
  minute,
  second,
  millisecond
}

export const coerceToUtc = (date: Date, granularity = DateGranularity.millisecond) => {
  return new Date(Date.UTC(date.getFullYear(),
    granularity >= DateGranularity.month && date.getMonth(),
    granularity >= DateGranularity.day && date.getDate(),
    granularity >= DateGranularity.hour && date.getHours(),
    granularity >= DateGranularity.minute && date.getMinutes(),
    granularity >= DateGranularity.second && date.getSeconds(),
    granularity === DateGranularity.millisecond && date.getMilliseconds()
  ));
};
