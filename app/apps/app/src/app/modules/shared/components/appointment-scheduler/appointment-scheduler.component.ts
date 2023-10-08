import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators } from '@angular/forms';
import { AppointmentEntity, SpecialistUser } from '@app/ui';
import { addDays, isAfter, isBefore, isEqual, isSameDay, subDays } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { AppointmentSchedule, DaySlots, Timeslot } from '../../../../models/timeslot.dto';
import { BookingFlowService } from '../../../patient/services/booking-flow.service';
import { SchedulerService, Slots } from '../../services/scheduler.service';
import { isBeforeDay } from '../../utils/date.utils';
import { SchedulerRestrictions } from '../scheduler/scheduler.component';

/**
 * Used to cache previously loaded slots while fetching new ones.
 * Allows creating a slot with only a known date while waiting for the rest of the data to load.
 */
class LoadedDaySlots extends DaySlots {
  loading?: boolean;
}

@Component({
  selector: 'app-appointment-scheduler',
  templateUrl: './appointment-scheduler.component.html',
  styleUrls: ['./appointment-scheduler.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppointmentSchedulerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AppointmentSchedulerComponent),
      multi: true,
    }
  ]
})
export class AppointmentSchedulerComponent implements OnInit, ControlValueAccessor, Validator, OnChanges  {
  @Input()
  public from: Date = new Date();

  @Input()
  public type: string;

  @Input()
  public specialist: SpecialistUser;

  @Input()
  public appointment: AppointmentEntity;

  @Input()
  public zipCode: string;

  @Output()
  outsideServiceArea: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _isOutsideServiceArea: boolean;

  set isOutsideServiceArea(value: boolean) {
    this._isOutsideServiceArea = value;
    this.outsideServiceArea.emit(value);
  }

  get isOutsideServiceArea(): boolean {
    return this._isOutsideServiceArea;
  }

  private _showPriorityFlag = false;

  @Input()
  set showPriorityFlag(val: boolean) {
    this._showPriorityFlag = coerceBooleanProperty(val);
  }

  get showPriorityFlag(): boolean {
    return this._showPriorityFlag;
  }

  @Input()
  public bufferSize: number = 10;

  private _showPrice = false;

  @Input()
  set showPrice(val: boolean) {
    this._showPrice = coerceBooleanProperty(val);
  }

  get showPrice(): boolean {
    return this._showPrice;
  }

  public slotSelector = new FormControl(null, [Validators.required]);

  private _timezone: string;

  get timezone(): string {
    return this._timezone;
  }

  set timezone(tz: string) {
    this._timezone = tz;
    this.bookingFlowService.timezone = tz;
  }

  private _restrictions: SchedulerRestrictions;

  private _timeslot: Timeslot;

  private _days: number;

  private onChange: (timeslot: Timeslot) => void;

  private onTouched: () => void;

  public set timeslot(timeslot: Timeslot) {
    this._timeslot = timeslot;

    if (this.onChange) {
      this.onChange(timeslot);
    }
  }

  public get timeslot() {
    return this._timeslot;
  }

  @Input()
  set restrictions(restrictions: SchedulerRestrictions) {
    this._restrictions = restrictions;

    /* If the new set of restrictions is supplied, and the slot is set, check to see if the slot is
     * still valid. */
    if (this.timeslot && restrictions && restrictions.isRestricted(this.timeslot)) {
      this.timeslot = null;

      /* Select the first available date */
      this.goToFirstAvailableDate();
    }
  }

  get restrictions() {
    return this._restrictions;
  }

  public slotsByDay$: Observable<AppointmentSchedule<LoadedDaySlots>>;

  public loadedSlotsByDay: LoadedDaySlots[];

  public selectedDailySlotSet: LoadedDaySlots;

  public numberOfDays: number;

  constructor(private readonly schedulerService: SchedulerService, private readonly bookingFlowService: BookingFlowService) {
    /* Always clear the timeslot cache before initializing the scheduler... */
    this.schedulerService.clearCache();
  }

  ngOnInit(): void {
    if (!this.from) {
      // TODO: Fix this - does not currently work due to how the initial data is fetched
      // this.from = utcToZonedTime(new Date(), 'America/Phoenix');
    }

    this.slotSelector.valueChanges.subscribe(val => {
      this.timeslot = val;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.zipCode) {
      this.schedulerService.clearCache();
      this.from = new Date();
      this.goToFirstAvailableDate(this.from, this.days);
    } else if (changes.specialist && !changes.specialist.isFirstChange() && this.zipCode) {
      this.slotsByDay$ = this.schedulerService.getUpcomingSlots(this.type, this.timezone, {
        from: this.from,
        days: this.numberOfDays,
        zip: this.zipCode,
        specialist: this.specialist,
        appointment: this.appointment,
        refresh: true,
        bufferSize: this.bufferSize
      }).pipe(
        tap(result => {
          if (result) {
            this.timezone = result.tz;
            this.loadedSlotsByDay = result.data;
          }
        }),
        /* Share this observable to prevent multiple endpoint invocations. */
        shareReplay(),
      );
    }
  }

  writeValue(timeslot: Timeslot): void {
    /* Only write the value if it's within the bounds of the currently-known restrictions */
    if (!timeslot || !this._restrictions || !this._restrictions.isRestricted(timeslot)) {
      this.timeslot = timeslot;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @Input()
  public set days(numberOfDays: number) {
    /* Retrieve the upcoming timeslots */
    this._days = numberOfDays;
    this.goToFirstAvailableDate(this.from, numberOfDays);
  }

  public get days() {
    return this._days;
  }

  public updateDays(numberOfDays: number, from: Date, refresh = false) {
    this.numberOfDays = Math.abs(numberOfDays);
    this.from = from;

    return this.schedulerService.getUpcomingSlots(this.type, this.timezone, {
      from,
      days: numberOfDays,
      zip: this.zipCode,
      specialist: this.specialist,
      appointment: this.appointment,
      refresh,
      bufferSize: this.bufferSize
    }).pipe(
      tap(result => {
        if (result) {
          this.timezone = result.tz;
          this.loadedSlotsByDay = result.data;
        }
      }),
      /* Share this observable to prevent multiple endpoint invocations. */
      shareReplay(),
    );
  }

  public getLowestSlotPrice(day: DaySlots): number | null {
    const bestPricedSlot = day.slots
      .filter(timeslot => !!timeslot.key)
      .reduce((timeslot, current) => timeslot && timeslot.price < current.price ? timeslot : current, null);

    return bestPricedSlot ? bestPricedSlot.price : null;
  }

  public goToFirstAvailableDate(from = new Date, days = this.numberOfDays) {
    // If the user hasn't set their zip code yet create placeholder dates
    if (!this.zipCode || !days) {
      this.slotsByDay$ = of({ data: this._placeHolderSlots(from, days), serviceable: null, tz: undefined }).pipe(tap(result => this.loadedSlotsByDay = result.data));
      this.selectedDailySlotSet = null;
      return;
    }
    /* Resolve the date set that commences with the first available date from the supplied 'from' value. */
    this.slotsByDay$ = this._resolveFromFirstAvailableDate(from, days).pipe(

      /* Set the first date in the retrieved set as selected - we know that this date will be available due to the
       * fact that _resolveFromFirstAvailableDate will only emit collections that start with an available date. */
      tap(result => {
        this.selectedDailySlotSet = result && result.data && result.data[0];
        this.isOutsideServiceArea = result && result.serviceable === false;
        this.timezone = result && result.tz;
      }),

      shareReplay(),
    );
  }

  isTodayOrBefore(date: Date) {
    const now = new Date();
    return !date || isBeforeDay(date, now) || isSameDay(date, now);
  }

  next() {
    // If currently loading allow the user to still scroll forward to the already loaded slots. Once they get to the loading slot they will have to wait
    if (this._hasPlaceHolder()) {
      return this._nextLoadedSlotDay();
    }
    /* Determine the next base day from which we should query availability.  Use the next known available day, if
     * known - otherwise, just use the next day. */
    this.slotsByDay$ = this.slotsByDay$.pipe(
      map(result => {
        const slotsByDay = result && result.data;
        const nextDay = slotsByDay && slotsByDay.length > 1 ? slotsByDay[1].date : addDays(this.from, 1);
        this._slotDayPlaceHolder();
        return nextDay;
      }),

      switchMap(nextDay => this.updateDays(this.numberOfDays, nextDay)),

      /* If a previous day that is not within the bounds of the retrieved set of dates is currently selected, we need
       * to update the lowest allowable day. */
      tap(result => {
        if (!this.selectedDailySlotSet ||
          (result && result.data && result.data.length && isBefore(this.selectedDailySlotSet.date, result.data[0].date))) {
          this.selectedDailySlotSet = result[0];
        }
        this._updateSelectedSlotDayPlaceholder(result.data);
        this.timezone = result && result.tz;
      }),

      shareReplay(),
    );
  }

  isSelected(dailySlots: DaySlots) {
    return !!this.selectedDailySlotSet && isSameDay(dailySlots.date, this.selectedDailySlotSet.date);
  }

  async previous() {
    this.slotsByDay$ = this.slotsByDay$.pipe(
      map(result => {
        const slotsByDay = result && result.data;
        const prevDay = slotsByDay && slotsByDay.length ? slotsByDay[slotsByDay.length - 1].date : this.from;
        this._slotDayPlaceHolder(true);
        return prevDay;
      }),

      // Works as the slot grouping dates are always at the start of the day.
      switchMap(currentDay => this.updateDays(this.numberOfDays * -1, currentDay)),

      /* If a previous day that is not within the bounds of the retrieved set of dates is currently selected, we need
       * to update the highest allowable day. */
      tap(result => {
        if (!this.selectedDailySlotSet ||
          (result && result.data && result.data.length && isAfter(this.selectedDailySlotSet.date, result.data[result.data.length - 1].date))) {
          /* Set the nearest bound-friendly date (working backwards as we are seeking previous dates) */
          this.selectedDailySlotSet = result.data[result.data.length - 1];
        }
        this._updateSelectedSlotDayPlaceholder(result && result.data);
      }),

      shareReplay(),
    );
  }

  public getDate(dailySlots: DaySlots) {
    return dailySlots.date;
  }

  public hasSlots(dailySlots: DaySlots): boolean {
    return dailySlots.slots && dailySlots.slots.length > 0;
  }

  public hasBookableSlots(dailySlots: DaySlots) {
    return this.hasSlots(dailySlots) && dailySlots.slots.find(slot => slot.key) &&
      (!this.restrictions || !!dailySlots.slots.find(slot => !this.restrictions.isRestricted(slot)));
  }

  validate(control: AbstractControl) {
    return !this.timeslot ? { required: true } : null;
  }

  isDisabled(): boolean {
    return !this.zipCode;
  }

  /**
   * Creates a place holder slot while new slots are loaded.
   * If prev remove the highest date and add one day before the lowest date at the start
   * else next, remote lowest date and one day after highest date at the end
   */
  private _slotDayPlaceHolder(prev = false) {
    const placeholder: LoadedDaySlots = {
      date: null,
      slots: [],
      loading: true,
    };
    if (prev) {
      const last = this.loadedSlotsByDay.pop();
      placeholder.date = subDays(this.loadedSlotsByDay[0].date, 1);
      this.loadedSlotsByDay.unshift(placeholder);
      // If the selected day was removed select the day in it's position now
      if (last === this.selectedDailySlotSet) {
        this.selectedDailySlotSet = this.loadedSlotsByDay[this.loadedSlotsByDay.length - 1];
      }
    } else {
      const first = this.loadedSlotsByDay.shift();
      placeholder.date = addDays(this.loadedSlotsByDay[this.loadedSlotsByDay.length - 1].date, 1);
      this.loadedSlotsByDay.push(placeholder);
      // If the selected day was removed select the day in it's position now
      if (first === this.selectedDailySlotSet) {
        this.selectedDailySlotSet = this.loadedSlotsByDay[0];
      }
    }
  }

  /**
   * If the selected day was a placeholder but now has real data update it
   */
  private _updateSelectedSlotDayPlaceholder(updatedSlots: Slots[]) {
    // Not a placeholder no need to update.
    if (!this.selectedDailySlotSet.loading) {
      return;
    }
    const updatedSlot = updatedSlots.find(s => isEqual(s.date, this.selectedDailySlotSet.date));
    if (updatedSlot) {
      this.selectedDailySlotSet = updatedSlot;
    }
  }

  /**
   * Check if any of the loaded slots by day is a placeholder
   */
  private _hasPlaceHolder(): boolean {
    return this.loadedSlotsByDay.some(slot => slot.loading);
  }

  private _placeHolderSlots(from: Date, days: number): LoadedDaySlots[] {
    const slots: LoadedDaySlots[] = [];
    for (let i = 0; i < days; i++) {
      const slot = {
        date: addDays(from, i),
        slots: [],
        loading: true
      };
      slots.push(slot);
    }
    return slots;
  }

  /**
   * Select the next already loaded slot day
   */
  private _nextLoadedSlotDay(): void {
    const selectedIndex = this.loadedSlotsByDay.findIndex(s => isEqual(s.date, this.selectedDailySlotSet.date));
    if (selectedIndex !== -1 && this.loadedSlotsByDay[selectedIndex + 1]) {
      this.selectedDailySlotSet = this.loadedSlotsByDay[selectedIndex + 1];
    }
  }

  private _resolveFromFirstAvailableDate(from: Date, days): Observable<AppointmentSchedule> {
    return this.schedulerService.getUpcomingSlots(this.type, this.timezone, {
      from,
      days: days,
      zip: this.zipCode,
      specialist: this.specialist,
      appointment: this.appointment,
      countAvailable: true,
      bufferSize: this.bufferSize
    }).pipe(
      switchMap(result => {
        if (!result || !result.serviceable || !result.data) {
          return of(result);
        }
        /* Find the first available date, according to local restrictions, and set that as our 'from' date. If we do not
         * have an unrestricted date we can use, we will need to refresh the date set (see below) */
        const first = result.data.find(daySlots => this.hasBookableSlots(daySlots));

        /* Invoke a call to the local cache to grab the configured amount of days from the identified date. If the
         * current set does not have any available days, we will need to refresh the date set entirely from the scheduler
         * service */
        return first ? this.updateDays(days, first.date) :
          (result.data.length ? this._resolveFromFirstAvailableDate(addDays(result.data[result.data.length - 1].date, 1), days) : of(null));
      }));
  }
}
