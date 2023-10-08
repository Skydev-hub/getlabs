import { Component, forwardRef, Input, OnDestroy, OnInit, Type } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SimpleTime, SimpleTimeRange, AutoUnsubscribe, BusinessHoursService } from '@app/ui';
import { set } from 'date-fns';
import { combineLatest, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { filter, map, pairwise, shareReplay, startWith, withLatestFrom } from 'rxjs/operators';

export enum DefaultTimeTypes {
  StartOfDay = 'StartOfDay',
  EndOfDay = 'EndOfDay'
}

const DEFAULT_BUSINESS_HOURS = new SimpleTimeRange(new SimpleTime(0, 0), new SimpleTime(23, 59));

@Component({
  selector: 'app-time-selector',
  templateUrl: './time-selector.component.html',
  styleUrls: ['./time-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeSelectorComponent),
      multi: true
    }
  ]
})
export class TimeSelectorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input()
  public modelType: Type<Date> | Type<SimpleTime> = SimpleTime;

  @Input()
  public defaultTime: DefaultTimeTypes | SimpleTime;

  @Input()
  public set minuteIntervals(minutes: number) {
    /* Ensure that the supplied value is divisible into 60... */
    if (typeof minutes !== 'number' || 60 % minutes) {
      throw new Error(`The supplied minutes value is invalid - must be divisible by 60`);
    }

    this._minuteIntervals = minutes;
  }

  public get minuteIntervals() {
    return this._minuteIntervals;
  }

  @Input()
  public restrictRange: SimpleTimeRange | boolean;

  public formControl: FormControl = new FormControl(null);

  public _restrictRange$: ReplaySubject<SimpleTimeRange> = new ReplaySubject<SimpleTimeRange>();

  public _timeOptions$: Observable<SimpleTime[]>;

  private _input$: ReplaySubject<SimpleTime> = new ReplaySubject<SimpleTime>(1);

  private _output$: Observable<SimpleTime | Date>;

  private _minuteIntervals: number = 15;

  private _seedDate: Date = new Date();

  private onTouched: () => void;

  private _subscriptions: Subscription[] = [];

  constructor(private readonly businessHoursService: BusinessHoursService) {}

  public ngOnInit(): void {
    /* Configure the inbound restrictRange value, or use the default hours range if no value is supplied.  Resolution
     * is asynchronous as retrieval of configuration parameters is also asynchronous by necessity. */
    (this.restrictRange === true ? this.businessHoursService.getBusinessHours$() : of(this.restrictRange)).subscribe(
      AutoUnsubscribe(val => {
        this._restrictRange$.next(val || DEFAULT_BUSINESS_HOURS);
      })
    );

    /* Initialize the output stream according to the supplied model type.  This must be initialized here, as the
     * subscription in writeValue may run synchronously if restrictRange is already available. */
    this._output$ = this.formControl.valueChanges.pipe(
      map(val => {
        /* Bound value will depend on what the user has selected as the value type. */
        return (
          val && (this.modelType === SimpleTime ? new SimpleTime(val.hours, val.minutes) : set(this._seedDate, { hours: val.hours, minutes: val.minutes }))
        );
      }),

      shareReplay(1)
    );

    this._subscriptions.push(this._output$.subscribe());

    /* Whenever the inbound selectable hours changes, we will need to update the set of selectable hours options such that
     * they correspond with the defined range. */
    this._timeOptions$ = this._restrictRange$.asObservable().pipe(
      filter(range => !!range),
      map(range => {
        const options: SimpleTime[] = [];

        /* If the start time is after the end time, that means we have a range that spans midnight.  In that case, add 12 hours
         * to the end time, so we can handle it evenly below. */
        const adjustedEndHours = range.start.hours > range.end.hours ? range.end.hours + 12 : range.end.hours;

        /* Map to an array of SimpleTime elements, where each will represent a selectable option. */

        /* Hours set - iterate up to and including the end hours bound. */
        for (let hours = range.start.hours; hours <= adjustedEndHours; hours++) {
          /* Minutes set - if we're on the start hour, we should start at the start bound's minute set.  For each hour, the
           * loop will iterate until it reaches 60- unless we're on the end hour, then the loop will iterate until it reaches
           * the end bound. */
          for (
            let minutes = hours === range.start.hours ? range.start.minutes : 0;
            minutes <= (hours === adjustedEndHours ? range.end.minutes : 59);
            minutes += this._minuteIntervals
          ) {
            options.push(new SimpleTime(hours % 24, minutes));
          }
        }

        return options;
      }),

      shareReplay(1)
    );

    /* Whenever the input value changes, we will need to ensure that the value corresponds with one of the selectable values. */
    this._subscriptions.push(
      combineLatest([this._input$, this._timeOptions$, this._restrictRange$.pipe(filter(val => !!val))])
        .pipe(
          /* Bring in the most recent value from the form control - we need to use this if it's more recent than the _input$ val */
          withLatestFrom(this.formControl.valueChanges.pipe(startWith(null)) as Observable<SimpleTime>),

          map(val => {
            /* Map to a more digestible format. */
            const [inputVal, timeOptions, restrictRange] = val[0];

            return {
              inputVal,
              timeOptions,
              restrictRange,
              formControlVal: val[1]
            };
          }),

          /* Deliberately trigger a null emission so that the rest of the stream invokes once the combineLatest stream emits
           * for the first time. */
          startWith(null),

          /* Scan this emission compared to the previous emission - determine whether _input$ or formControl.value is the most
           * recent form control value. */
          pairwise(),

          map(([previous, current]) => ({
            timeOptions: current.timeOptions,
            restrictRange: current.restrictRange,

            /* Need to determine if this value is appropriate according to the current/previous input and form control vals. */
            value: !previous || previous.inputVal !== current.inputVal ? current.inputVal : current.formControlVal
          }))
        )
        .subscribe(({ timeOptions, restrictRange, value }) => {
          this._setValue(timeOptions, restrictRange, value);
        })
    );
  }

  writeValue(val: Date | SimpleTime): void {
    /* Type narrowing.... */
    let simpleTime: SimpleTime = val as SimpleTime;

    /* If we receive a date object, transform it into a SimpleTime, and coerce it to a bound-compliant time.
     * We also need to keep track of the original seed time value, so we can use it on registerOnChanged */
    if (simpleTime instanceof Date) {
      this._seedDate = simpleTime;
      simpleTime = new SimpleTime(simpleTime.getHours(), simpleTime.getMinutes());
    }

    this._input$.next(simpleTime);
  }

  registerOnChange(fn: any): void {
    /* setTimeout is annoyingly required, as _output$ is a hot observable that may invoke synchronously with
     * subscribe, and updating the value within the same stack causes change detector errors. */
    setTimeout(() => {
      this._subscriptions.push(this._output$.subscribe(val => fn(val)));
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  private _setValue(timeOptions: SimpleTime[], restrictRange: SimpleTimeRange, value: SimpleTime) {
    /* If a time value is produced from the above, Ensure we coerce the supplied time value to a compliant time.
     * If no time value is produced above, use the default time, or a blank object if no default time exists. */
    let boundedVal = value && restrictRange.toBoundCompliantSimpleTime(value);

    /* If the bounded value evaluates to null, and we have a default time value provided, use the default
     * time instead. */
    if (!boundedVal && this.defaultTime) {
      let defaultTime: SimpleTime = this.defaultTime as SimpleTime;

      if (typeof defaultTime === 'string') {
        /* Handle cases where the supplied value is an enum */
        defaultTime = this.defaultTime === DefaultTimeTypes.StartOfDay ? restrictRange.start : restrictRange.end;
      }

      boundedVal = defaultTime && restrictRange.toBoundCompliantSimpleTime(defaultTime);
    }

    /* Since we're dealing with a finite set of SimpleTime values, we need to find the value that corresponds
     * best to the inbound value. */
    const result = timeOptions.find(
      timeOption =>
        timeOption.hours === boundedVal.hours &&
        (timeOption.minutes === boundedVal.minutes || Math.abs(timeOption.minutes - boundedVal.minutes) < this._minuteIntervals)
    );

    /* Set the form control to the resolved value... it's possible that the resolved value is null. */
    this.formControl.setValue(result);
  }
}
