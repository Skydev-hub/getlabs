import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SpecialistUser } from '@app/ui';
import {
  addBusinessDays,
  addDays,
  isAfter,
  isBefore,
  isSameDay,
  isWeekend,
  subBusinessDays,
  subDays
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Timeslot } from '../../../../models/timeslot.dto';
import { SchedulerService } from '../../services/scheduler.service';
import { isAfterDay, isBeforeDay} from '../../utils/date.utils';

export enum RestrictedGranularity {
  day = 'day',
}

/**
 * Defines an allowable booking window according to a start date/time and an end date/time.
 */
export class SchedulerRestrictions {
  constructor(public bookableRangeStart?: Date, public bookableRangeEnd?: Date) {}

  private static Operators = {
    [RestrictedGranularity.day]: {
      isBefore: isBeforeDay,
      isAfter: isAfterDay,
    },

    Default: {
      isBefore: isBefore,
      isAfter: isAfter,
    }
  };

  /**
   * Determines if the supplied timeslot / date is restricted (i.e. not within the defined booking bounds)
   * according to the supplied granularity.  If the supplied value is a Timeslot object, this method will
   * check to see if the timeslot commences before the defined start date/time or ends after the defined
   * end date/time.  If the supplied granularity is 'day', this method will simply compare the calendar
   * date of the supplied timeslot/date with the calendar date of the restriction bounds.
   */
  isRestricted(timeslot: Timeslot | Date, granularity?: RestrictedGranularity): boolean {
    /* Retrieve operators that apply to the supplied granularity level */
    const operators = (granularity && SchedulerRestrictions.Operators[granularity]) ||
      SchedulerRestrictions.Operators.Default;

    const start = timeslot instanceof Timeslot ? timeslot.start : timeslot;
    const end = timeslot instanceof Timeslot ? timeslot.end : timeslot;

    return (this.bookableRangeStart && operators.isBefore(start, this.bookableRangeStart)) ||
      (this.bookableRangeEnd && operators.isAfter(end, this.bookableRangeEnd));
  }
}

@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss'],
  providers: [SchedulerService]
})
export class SchedulerComponent implements OnInit {

  private _start: Date = new Date();

  private _restrictions: SchedulerRestrictions;

  @Input()
  set restrictions(restrictions: SchedulerRestrictions) {
    this._restrictions = restrictions;

    /* If the new set of restrictions is supplied, and the slot is set, check to see if the slot is
     * still valid. */
    if (this.slot && restrictions && restrictions.isRestricted(this.slot)) {
      this.slot = null;
    }
  }

  get restrictions() {
    return this._restrictions;
  }

  @Input()
  set start(date) {
    this._start = this.convertToZonedTime(date, this.timezone);
    this.setDateRangeStartingFrom(this._start);
  }

  @Input()
  public type: string;

  get start() {
    return this._start;
  }

  @Input()
  numDays = 3;

  @Input()
  weekends: boolean = false;

  @Input()
  timezone: string;

  @Input()
  specialist: SpecialistUser;

  @Output()
  select = new EventEmitter<Timeslot>();

  // Selected slot
  private _slot: Timeslot;

  set slot(slot: Timeslot) {
    this._slot = slot;
    this.select.emit(slot);
  }

  get slot(): Timeslot {
    return this._slot;
  }

  // Dates to show
  dates: Date[] = [];

  constructor() { }

  ngOnInit() {
    this.start = this.convertToZonedTime(this.start);
    this.setDateRangeStartingFrom(this.start);
  }

  moveDateRange(delta: number) {
    if (this.dates.length) {
      this.setDateRangeStartingFrom(delta > 0 ? this.addDays(this.dates[0], delta) : this.subDays(this.dates[0], Math.abs(delta)));

      // Deselect slots when they move off screen
      if (!this.isSelectedSlotVisible()) {
        this.slot = null;
      }
    }
  }

  hasPreviousDay(): boolean {
    if (!this.dates.length) {
      return false;
    }

    const firstDate = this.dates[0];

    return !(isSameDay(firstDate, this.start) || isBefore(this.subDays(firstDate, 1), this.start));
  }

  hasNextDay(): boolean {
    if (!this.dates.length) {
      return false;
    }

    return isAfter(addDays(this.start, 90), this.dates[this.dates.length - 1]);
  }

  isSelectedSlotVisible(): boolean {
    return this.slot && !!this.dates.find(date => isSameDay(date, this.slot.start));
  }

  /**
   * Determine the date range to display starting with the given date, skipping weekends.
   */
  private setDateRangeStartingFrom(date: Date): void {
    this.dates = [];

    let offset = 0;

    // Add the next X days days
    while (this.dates.length < this.numDays) {
      const nextDate = addDays(date, offset);

      // Note: This component by default skips showing weekends because Getlabs does not operate on weekends
      //  However, in certain cases we want to display weekends too (such as appointment rebooking by admin)

      if (this.weekends || !isWeekend(nextDate)) {
        this.dates.push(nextDate);
      }

      offset++;
    }
  }

  /**
   * Convert local date to zoned time to solve discrepancies between the browser's timezone
   * and the user's actual timezone.
   */
  private convertToZonedTime(date: Date, tz?: string): Date {
    return tz ? utcToZonedTime(date.toISOString(), tz) : date;
  }

  /**
   * Adds X number of days to the given date.
   */
  private addDays(date: Date, days: number): Date {
    return this.weekends ? addDays(date, days) :  addBusinessDays(date, days);
  }

  /**
   * Subtracts X number of days from the given date.
   */
  private subDays(date: Date, days: number): Date {
    return this.weekends ? subDays(date, days) : subBusinessDays(date, days);
  }

}


