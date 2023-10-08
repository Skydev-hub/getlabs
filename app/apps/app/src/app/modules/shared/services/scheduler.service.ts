import { Injectable } from '@angular/core';
import { SpecialistUser } from '@app/ui';
import { addDays, differenceInDays, isSameDay, startOfDay } from 'date-fns';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { forEach } from '@app/ui';
import { AppointmentSchedule, DaySlots, Timeslot } from '../../../models/timeslot.dto';
import { isAfterDay, isBeforeDay } from '../utils/date.utils';
import { AvailabilityService, RangeQueryOptions } from './availability.service';

export interface SchedulerRangeQueryOptions extends RangeQueryOptions {
  countAvailable?: boolean;
  refresh?: boolean;
  bufferSize?: number; // How many extra days in the future to cache
}

export class Slots extends DaySlots {
  specialist?: SpecialistUser;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {

  fetchTimeslots$: Observable<AppointmentSchedule>;

  slots: Slots[] = [];

  tz: string;

  constructor(private availabilityService: AvailabilityService) { }

  public getAvailableSlots(type: string, date: Date, timezone: string, specialist?: SpecialistUser): Observable<Timeslot[]> {

    const cachedTimeslots = this.getCachedTimeslots(date, specialist);

    if (cachedTimeslots) {
      return of(cachedTimeslots.slots);
    }

    return this.availabilityService.availability(type, [date], timezone, specialist).pipe(
      tap(slots => this.updateCache({date, slots}, 'America/Phoenix'))
    );
  }

  public clearCache() {
    this.slots = [];
    this.tz = undefined;
  }

  public getUpcomingSlots(type: string, timezone: string, options: SchedulerRangeQueryOptions = { from: new Date() }): Observable<AppointmentSchedule> {
    const from = options.from || new Date();
    const days = options.days;
    const bufferSize = options.bufferSize || 1;

    /* If the consumer has requested to clear the local cache, ensure that it's purged before proceding. */
    if (options.refresh) {
      this.clearCache();
    }

    /* First, we'll check the cache.  Due to a ridiculous amount of uncertainty, we can only return consecutive days; otherwise,
     * we'll need to defer to the API. */
    let cachedWithinWindow: Slots[] = [];

    // Track the cache index of the last within window to check if enough days are buffered after
    let lastCachedWithinWindowIndex = 0;
    for (let i = 0; i < this.slots.length && (options.countAvailable ?
      cachedWithinWindow.filter(daySlots => !!daySlots.slots.length) : cachedWithinWindow).length < Math.abs(days); i++) {
      lastCachedWithinWindowIndex = i;
      const slot = this.slots[i];
      const dateDiff = differenceInDays(startOfDay(slot.date), startOfDay(from));

      /* Rule out invalid cases */
      if (days * dateDiff < 0 || ((!options || !options.countAvailable) && (Math.abs(dateDiff) > Math.abs(days)))) {
        continue;
      }

      /* Add dates that are after and/or on the indicated 'from' date, and within the prescribed number days. */
      /* Days is positive - extract all days including and following the target date */
      if ((days > 0 && (isAfterDay(slot.date, from) || isSameDay(slot.date, from))) ||
        (days < 0 && (isBeforeDay(slot.date, from) || isSameDay(slot.date, from)))) {
        cachedWithinWindow.push(slot);
      }
    }

    /* If we are dealing with a negative case, we'll need to flip the array to ensure ordering is correct. */
    if (days < 0) {
      cachedWithinWindow = cachedWithinWindow.reverse();
    }

    const consecutiveDays: Slots[] = [];

    for (let i = 0; i < cachedWithinWindow.length; i++) {
      /* Only consider consecutive days. */
      // TODO currently this algorithm only retrieves cached days that are in sequence from the supplied 'from' date.  Once we
      //  encounter a date that is not a consecutive day in this chain, the below loop will break.  This should be updated to identify
      //  specific gaps in the cache, and refresh those gaps... even if it does require multiple API calls.
      //  I suppose this gap could also be addressed by adding blank definitions to fill in the gap for unavailable days.
      const lastDay = (i && cachedWithinWindow[i - 1].date) || from;

      if (Math.abs(differenceInDays(startOfDay(cachedWithinWindow[i].date), startOfDay(lastDay))) > 1) {
        break;
      }

      consecutiveDays.push(cachedWithinWindow[i]);
    }

    // Check how many more days are buffered after the last one being returned.
    const bufferedCount = this.slots.slice(lastCachedWithinWindowIndex).length;

    // If not enough days are buffered and more are not currently being fetched, fetch some more.
    if (bufferedCount < bufferSize && !this.fetchTimeslots$) {
      this.buffer(type, timezone, options);
    }

    /* If the cache contains the same number of consecutive days as the days param, we can simply return the cached days. */
    if (consecutiveDays.length >= Math.abs(days)) {
      return of({ serviceable: true, data: days < 0 ? consecutiveDays.reverse() : consecutiveDays, tz: this.tz });
    }

    // Consumer asking for days that are not cached, return the observable fetching more.
    return this.fetchTimeslots$.pipe(
      map(result => {
        forEach((result && result.data) || [], (dailySlots) => {
          /* If we have reached max capacity, break from the loop. */
          if (consecutiveDays.length >= Math.abs(days)) {
            return false;
          }

          /* Otherwise, add the current day. */
          consecutiveDays.push(dailySlots);
        }, days < 0);

        return {
          serviceable: result.serviceable,
          data: consecutiveDays,
          tz: result.tz,
        };
      }),
    );
  }

  /**
   * Fetch requested and future slots and store them in the cache.
   */
  private buffer(type: string, timezone: string, options: SchedulerRangeQueryOptions) {
    const days = options.days || 1;
    let queryDays = (options.bufferSize || 1);
    let queryFrom;

    // Tweak the request params for an empty cache
    if (this.slots.length === 0) {
      // Start from the requested day or today
      queryFrom = options.from || new Date();
      // Get enough slots to fulfill the amount requested and fill the buffer.
      queryDays += days;
    } else {
      // Start from the day after last day cached
      queryFrom = addDays(this.slots[this.slots.length - 1].date, 1);
    }

    this.fetchTimeslots$ = this.availabilityService.upcomingTimeslots(type, timezone, {
      from: queryFrom,
      days: queryDays,
      specialist: options.specialist,
      appointment: options.appointment,
      zip: options.zip
    }).pipe(shareReplay(1));

    this.fetchTimeslots$.subscribe(res => {
      if (res && res.data) {
        res.data.forEach(dailySlotsSet => this.updateCache(dailySlotsSet, res.tz));
      }
      this.fetchTimeslots$ = null;
    });
  }

  private updateCache(daySlots: Slots, tz: string) {
    /* Find the slot defined by this interval in the cache. */
    const cached = this.getCachedTimeslots(daySlots.date);

    /* If a cached object exists, update it.  Otherwise, we can push the resolved slot into the cache. */
    if (cached) {
      cached.slots = daySlots.slots;
      return;
    }

    this.slots.push(daySlots);
    this.tz = tz;
  }

  private getCachedTimeslots(date: Date, specialist?: SpecialistUser): Slots | undefined {
    return this.slots.find(slots => isSameDay(date, slots.date) && specialist === slots.specialist);
  }
}
