import { addDays, addMilliseconds, differenceInMilliseconds, format, isWeekend, set } from 'date-fns';

/**
 * Defines a simple time of day, which does not take timezones, dates, or anything else into consideration.
 */
export class SimpleTime {
  public hours: number;

  /**
   * Creates a simple time from the supplied military time string.
   */
  constructor(militaryTime: string);

  /**
   * Creates a simple time from the supplied hours and minutes number values.
   */
  constructor(hours: number, minutes: number);
  constructor(hoursOrMilitaryTime: number | string, public minutes?: number) {
    let hours = hoursOrMilitaryTime;

    /* If the inbound hoursOrMilitaryTime parameter is a string, we will need to parse it accordingly */
    if (typeof hours === 'string') {
      try {
        const split = hours.split(':');
        hours = parseInt(split[0], 10);
        this.minutes = parseInt(split[1], 10);
      } catch (err) {
        /* Parsing error */
        throw new Error(
          `Cannot create SimpleTime object - the inbound string must be in military time format- hh:mm.  Supplied value: ` +
            `${hoursOrMilitaryTime}.  Embedded exception: ${err}`
        );
      }
    }

    this.hours = hours;
  }

  /**
   * Converts the supplied date into a SimpleTime object.
   */
  static toSimpleTime(date: Date) {
    return new SimpleTime(date.getHours(), date.getMinutes());
  }

  toMilitaryTime(): string {
    return [String(this.hours).padStart(2, '0'), String(typeof this.minutes === 'number' ? this.minutes : 0).padStart(2, '0')].join(':');
  }

  toString(dateFormat?: string): string {
    /* If either of hours/mins is not set, return a blank string. */
    if (typeof this.hours !== 'number' || typeof this.minutes !== 'number') {
      return '';
    }

    /* Otherwise, compose a time string by creating a date object, and extracting the time value. */
    return format(
      set(new Date(), {
        hours: this.hours,
        minutes: this.minutes
      }),
      dateFormat || 'h:mm aaa'
    );
  }
}

/**
 * Defines a simple range of times within a given day (i.e. a start time to an end time) with no consideration for
 * timezones, dates, or anything of that ilk.
 *
 * In other words, the time bounds represents a range of times as it applies locally in *any given time zone*.
 */
// TODO object methods need to be updated to support potential wraparound times (i.e. end time is before start time)
export class SimpleTimeRange {
  constructor(public start: SimpleTime, public end: SimpleTime) {}

  /**
   * Ensures the inbound parameter is a SimpleTime object.
   */
  private sanitizeTime(date: Date | SimpleTime): SimpleTime {
    /* If the supplied date is a Date object, transform it to a SimpleDate object. */
    return date instanceof Date ? SimpleTime.toSimpleTime(date) : date;
  }

  /**
   * Determines if the supplied time is within the time range represented by this object.
   */
  isInRange(date: Date | SimpleTime): boolean {
    date = this.sanitizeTime(date);

    return !(this.isTimeBefore(date) || this.isTimeAfter(date));
  }

  /**
   * Determines if the supplied time occurs before the time range specified by this object.
   */
  isTimeBefore(date: Date | SimpleTime): boolean {
    date = this.sanitizeTime(date);
    return date.hours < this.start.hours || (date.hours === this.start.hours && date.minutes < this.start.minutes);
  }

  /**
   * Determines if the supplied time occurs after the time range specified by this object.
   */
  isTimeAfter(date: Date | SimpleTime): boolean {
    date = this.sanitizeTime(date);
    return date.hours > this.end.hours || (date.hours === this.end.hours && date.minutes > this.end.minutes);
  }

  /**
   * Retrieves a date object set to the same date as the supplied value, but with the time set to the start bound of this time range.
   */
  getStartBoundForDate(date: Date) {
    return this.getBoundForDate(date, this.start);
  }

  /**
   * Retrieves a date object set to the same date as the supplied value, but with the time set to the end bound of this time range.
   */
  getEndBoundForDate(date: Date) {
    return this.getBoundForDate(date, this.end);
  }

  private getBoundForDate(date: Date, bound: SimpleTime) {
    return set(date, { hours: bound.hours, minutes: bound.minutes, seconds: 0, milliseconds: 0 });
  }

  /**
   * Returns a new SimpleTime object that is guaranteed to be within the bounds described by current range object.
   */
  toBoundCompliantSimpleTime(
    time: SimpleTime,
    options: {
      coerceToStart?: boolean;
    } = {}
  ) {
    /* If the inbound time value is not in the bounds described by this range, we will need to marshall the value
     * to a compliant value, depending on whether or not the supplied time is before or after the range. */
    /* Before bounds, or after bounds with coerceToStart = true => coerce to the start of the bound. */
    if (this.isTimeBefore(time) || (this.isTimeAfter(time) && options.coerceToStart)) {
      return new SimpleTime(this.start.hours, this.start.minutes);
    } else if (this.isTimeAfter(time)) {

    /* After bounds in all other cases => coerce to the end of the bound. */
      return new SimpleTime(this.end.hours, this.end.minutes);
    }

    /* Within bounds => return a new object set to the same time as the supplied range. */
    return new SimpleTime(time.hours, time.minutes);

    // return this.isTimeBefore(time) || (this.isTimeAfter(time) && options.coerceToStart) ?
  }

  /**
   * Returns a Date with a time that is guaranteed to be valid according to the bounds set by this object.  If the time
   * represented by this date is already within range, this method will return a Date object with the same time as the
   * supplied date.  Otherwise, this method will return a Date with the time set to the most logically applicable
   * bound.
   */
  toBoundCompliantDate(
    date: Date,
    options: {
      pushToNextDay?: boolean;
      businessDaysOnly?: boolean;
      skipDateCb?: (d: Date) => boolean;
    } = {}
  ): Date {
    /* Copy the date to avoid changing the supplied value. */
    let result = new Date(date);

    /* If the date is before the start time, or after the end time, move transform the date to the nearest bound. */
    if (this.isTimeBefore(date)) {
      result.setHours(this.start.hours, this.start.minutes, 0, 0);
    } else if (this.isTimeAfter(date)) {
      /* If pushToNextDay is set, we will need to move this value to the next day. */
      const bound = options.pushToNextDay ? this.start : this.end;
      result = bound === this.end ? result : addDays(result, 1);

      result.setHours(bound.hours, bound.minutes, 0, 0);
    }

    /* If businessDaysOnly / the skip date call back is set, we will need to skip their respective indicated dates...
     * and also normalize the time of day to the start of the resulting date. */
    while ((options.businessDaysOnly && isWeekend(result)) || (options.skipDateCb && options.skipDateCb(result))) {
      result = set(addDays(result, 1), {
        hours: this.start.hours,
        minutes: this.start.minutes,
        seconds: 0,
        milliseconds: 0
      });
    }

    return result;
  }

  addTime(
    date: Date,
    milliseconds: number,
    options: {
      businessDaysOnly?: boolean;
      skipDateCb?: (d: Date) => boolean;
    } = {}
  ) {
    /* Ensure the inbound date is corrected to a value compliant with the range expressed by this instance. */
    date = this.toBoundCompliantDate(date);

    /* Accept only positive values */
    if (milliseconds <= 0) {
      throw new Error(`Cannot add the supplied milliseconds - the indicated milliseconds value is not greater than 0!  ms = ${milliseconds}`);
    }

    /* May need to potentially cycle through multiple days to add the fully-supplied amount of ms */
    while (milliseconds > 0) {
      /* If the supplied options indicate that this date is contraindicated, we should just advance the date by one day, and pass into
       * the next loop iteration. */
      if ((options.businessDaysOnly && isWeekend(date)) || (options.skipDateCb && options.skipDateCb(date))) {
        date = this.getStartBoundForDate(addDays(date, 1));
        continue;
      }

      /* Identify the end bound for this specific day */
      const eod = this.getEndBoundForDate(date);

      /* Calculate the amount of milliseconds left in the day. */
      const millisecondsLeftInDay = differenceInMilliseconds(eod, date);

      /* If the number of milliseconds to apply is less than the amount of milliseconds that are left in the day, we
       * can finally apply the outstanding amount of milliseconds. Otherwise, we must advance the running time to
       * the next day, and set it to the day's start of business hours. */
      date = milliseconds < millisecondsLeftInDay ? addMilliseconds(date, milliseconds) : this.getStartBoundForDate(addDays(date, 1));

      /* Reduce the outstanding amount of milliseconds to apply by the amount left in the day, and advance to the next day. */
      milliseconds = milliseconds - millisecondsLeftInDay;
    }

    return date;
  }
}
