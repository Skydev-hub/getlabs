import { Component, forwardRef, Input, Type } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators } from '@angular/forms';
import { SimpleTime, SimpleTimeRange, isPartiallyComplete, SimpleDateTime } from '@app/ui';
import { plainToClass } from 'class-transformer';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { DefaultTimeTypes } from '../time-selector/time-selector.component';

@Component({
  selector: 'app-date-time-selector',
  templateUrl: './date-time-selector.component.html',
  styleUrls: ['./date-time-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimeSelectorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateTimeSelectorComponent),
      multi: true
    }
  ]
})
export class DateTimeSelectorComponent implements ControlValueAccessor, Validator {
  @Input()
  minuteIntervals: number = 15;

  @Input()
  defaultTime: SimpleTime | DefaultTimeTypes;

  @Input()
  restrictRange: SimpleTimeRange | boolean;

  @Input()
  modelType: Type<Date> | Type<SimpleDateTime> = Date;

  /**
   * If provided, all times displayed through this control will be rendered in this timezone.  Note that
   * all values will automatically be translated into UTC before cascading time resulting Date value
   * back to the bound control, so there is no need for the consumer of this component to convert back
   * to UTC on their own.
   */
  @Input()
  timezone: string;

  @Input()
  public setTime: boolean = true;

  public formGroup: FormGroup;

  private onTouched: () => void;

  constructor(formBuilder: FormBuilder) {
    this.formGroup = formBuilder.group({
      date: [null, Validators.required],
      time: [null]
    });
  }

  writeValue(value: Date | SimpleDateTime): void {
    /* Create a SimpleDateTime object, which will be used to generate the backing model for this form. */
    let normalized: SimpleDateTime = (value as SimpleDateTime) || new SimpleDateTime();

    /* If the supplied value is a date, we have further processing to perform */
    if (normalized instanceof Date) {
      /* If the model type is date, and the timezone parameter is set, we will need to convert the inbound value from UTC
       * into the corresponding timezone. */
      normalized = SimpleDateTime.fromDate(this.modelType === Date && this.timezone ? utcToZonedTime(normalized, this.timezone) : normalized);
    }

    /* Update the date/time controls with the supplied value. */
    this.formGroup.patchValue({
      date: normalized.date,
      time: (this.setTime && normalized.time && new SimpleTime(normalized.time)) || null
    });
  }

  registerOnChange(fn: any): void {
    this.formGroup.valueChanges.subscribe(val => {
      this.onTouched();

      let result: SimpleDateTime | Date = null;

      /* Control at a minimum requires a valid date value. */
      if (val.date) {
        const formatter = Intl.NumberFormat('en-US', { minimumIntegerDigits: 2 });

        /* Form a single date object has its date/time properties set according to the form controls.
         * Expected value of date is a date string (yyyy-MM-dd)
         * Expected value of time is a SimpleTime object. */
        const builtVal = plainToClass(SimpleDateTime, {
          date: val.date,
          time:
            this.setTime && val.time && typeof val.time.hours === 'number'
              ? `${formatter.format(val.time.hours)}:${formatter.format(val.time.minutes || 0)}`
              : null
        });

        /* Set the resulting value according to the supplied model type.  TZ -> UTC conversion only applies in cases where the
         * model type is date, and the timezone parameter is defined. */
        result = this.modelType === Date ? (this.timezone && zonedTimeToUtc(builtVal.toDate(), this.timezone)) || builtVal.toDate() : builtVal;
      }

      fn(result);
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl) {
    /* This control is only ever considered on its own rights to be invalid if setTime is true, one of the date/time
     * values is not set. */
    return this.setTime && isPartiallyComplete(this.formGroup) ? { dateTime: true } : null;
  }
}
