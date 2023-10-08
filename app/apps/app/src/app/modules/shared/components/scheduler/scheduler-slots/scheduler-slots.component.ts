import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {Component, Input, OnChanges, OnDestroy, SimpleChanges, Optional, Output, EventEmitter, forwardRef} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Globals, SpecialistUser } from '@app/ui';
import { utcToZonedTime } from 'date-fns-tz';
import { Observable, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Timeslot } from '../../../../../models/timeslot.dto';
import { SchedulerService } from '../../../services/scheduler.service';
import { isSameDay } from '../../../utils/date.utils';
import { RestrictedGranularity, SchedulerComponent, SchedulerRestrictions } from '../scheduler.component';

@Component({
  selector: 'app-scheduler-slots',
  templateUrl: './scheduler-slots.component.html',
  styleUrls: ['./scheduler-slots.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SchedulerSlotsComponent),
      multi: true,
    }
  ]
})
export class SchedulerSlotsComponent implements OnChanges, OnDestroy, ControlValueAccessor {

  globals = Globals;

  private unsubscribe$ = new Subject<void>();

  private _restrictions: SchedulerRestrictions;

  private _selectedDate: Timeslot;

  public set selectedDate(timeslot: Timeslot) {
    this._selectedDate = timeslot;

    if (this.onChanged) {
      this.onChanged(timeslot);
    }
  }

  public get selectedDate() {
    return this._selectedDate;
  }

  _date: Date = new Date(); // Note: This date should already be zoned to the given user by the parent component

  onChanged: (timeslot: Timeslot) => void;

  onTouched: () => void;

  @Output()
  findFirstAvailableDate = new EventEmitter<void>();

  @Input()
  timezone: string;

  @Input()
  public set date(date: Date) {
    this._date = date;

    /* Refresh the set of available time slots... */
    this.loadSlots();
  }

  public get date() {
    return this._date;
  }

  @Input()
  type: string;

  @Input()
  specialist: SpecialistUser;

  @Input()
  set restrictions(restriction: SchedulerRestrictions) {
    this._restrictions = restriction;
    this.loadSlots();
  }

  private _showPriorityFlag = false;

  @Input()
  set showPriorityFlag(val: boolean) {
    this._showPriorityFlag = coerceBooleanProperty(val);
  }

  get showPriorityFlag(): boolean {
    return this._showPriorityFlag;
  }

  private _showPrice = false;

  @Input()
  set showPrice(val: boolean) {
    this._showPrice = coerceBooleanProperty(val);
  }

  get showPrice(): boolean {
    return this._showPrice;
  }

  slots$: Observable<Timeslot[]>;

  constructor(@Optional() public scheduler: SchedulerComponent, private schedulerService: SchedulerService) { }

  writeValue(timeslot: Timeslot): void {
    if (!this._restrictions || !timeslot || !this._restrictions.isRestricted(timeslot)) {
      this.selectedDate = timeslot;
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.specialist) {
      this.loadSlots();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadSlots() {
    this.slots$ = this.getAvailableSlots().pipe(
      takeUntil(this.unsubscribe$)
    );
  }

  select(slot: Timeslot): void {
    if (this.scheduler) {
      this.scheduler.slot = slot;
    }

    this.selectedDate = slot;
  }

  isSelected(slot: Timeslot): boolean {
    return ((this.scheduler && this.scheduler.slot) || this._selectedDate) === slot;
  }

  isBooked(slot: Timeslot): boolean {
    return !!slot.booked;
  }

  public hasSlots(slots: Timeslot[]): boolean {
    return slots && slots.length > 0;
  }

  public hasBookableSlots(slots: Timeslot[]) {
    return this.hasSlots(slots) && slots.find(slot => slot.key) &&
      (!this.restrictions || !!slots.find(slot => !this.restrictions.isRestricted(slot)));
  }

  /**
   * Retrieves the set of available timeslots for the configured date according to the configured
   * restrictions (i.e. filters out all appointment times that are not within the allowable booking
   * timeframe).
   */
  getAvailableSlots() {
    /* If bookableRangeStart is defined, and it's after the current date, then there is no need to attempt resolving
     * dates that are bookable. */
    if (this._restrictions && this._restrictions.isRestricted(this._date, RestrictedGranularity.day)) {
      return of([]);
    }

    let res = this.schedulerService.getAvailableSlots(this.type, this.date, this.timezone, this.specialist);

    /* If the supplied date is within the restricted range, we may need to apply a reduce function to filter out
     * restrictions. */
    if (this._restrictions &&
       ((this._restrictions.bookableRangeStart && isSameDay(this._restrictions.bookableRangeStart, this._date)) ||
        (this._restrictions.bookableRangeEnd && isSameDay(this._restrictions.bookableRangeEnd, this._date)))) {
      res = res.pipe(map(timeslots => this.filterByRestrictions(timeslots)));
    }

    return res;
  }

  isToday() {
    return isSameDay(utcToZonedTime(new Date(), this.timezone), this._date);
  }

  /**
   * Filters the supplied set of timeslots against the configured restrictions.
   */
  private filterByRestrictions(timeslots: Array<Timeslot>) {
    return timeslots.reduce((acc, timeslot) => {
      /* Only permit timeslots that are fully within the bookable range.  Undefined range bounds are treated as unbounded. */
      if (!this._restrictions.isRestricted(timeslot)) {
        acc.push(timeslot);
      }
      return acc;
    }, new Array<Timeslot>());
  }
}
