import { Component, forwardRef, Input, OnInit, Optional, Type } from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { isAfter } from 'date-fns';
import { getFormFieldError, SimpleDateTime, SimpleTimeRange } from '@app/ui';
import { AbstractFormSubGroup } from '../../../../types/abstract-form-sub-group';
import { DefaultTimeTypes } from '../../../time-selector/time-selector.component';

export interface DateRange {
  start: Date;
  end?: Date;
}

@Component({
  selector: 'app-date-range-input',
  templateUrl: './date-range-input.component.html',
  styleUrls: ['./date-range-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangeInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateRangeInputComponent),
      multi: true
    }
  ]
})
export class DateRangeInputComponent extends AbstractFormSubGroup implements OnInit, ControlValueAccessor, Validator {
  public form: FormGroup;

  public DefaultTimeTypes = DefaultTimeTypes;

  @Input()
  restrictRange: SimpleTimeRange | boolean;

  @Input()
  setTime: boolean = false;

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

  private onTouched: () => void = () => {};

  constructor(private fb: FormBuilder, @Optional() private formControlContainer: ControlContainer) {
    super(formControlContainer);
    this.form = fb.group({
      start: [null, Validators.required],
      end: [null, [this.getEndDateValidator(), Validators.required]]
    });
  }

  ngOnInit(): void {
    /* The validator for the 'end' field should be re-executed whenever the start field changes. */
    this.start.valueChanges.subscribe(() => this.end.updateValueAndValidity());

    /* Data should only be normalized if the setTime binding is set. */
    if (!this.setTime) {
      this.start.valueChanges.subscribe(this.normalizeData);
      this.end.valueChanges.subscribe(this.normalizeData);
    }

    /* Since this component contains a full form implementation, it should be registered with the FormGroupControl that represents it inside of the parent view. */
    if (this.formControlContainer) {
      this.registerSubForm(this.form);
    }
  }

  /**
   * @description
   * Sets the supplied date to midnight local time.
   */
  private normalizeData(date: Date): void {
    if (date) {
      date.setHours(0, 0, 0, 0);
    }
  }

  /**
   * @method getEndDateValidator
   * @description
   * Factory function that creates a validator for the end date property.  The resulting validator will throw a validation error if the end date is set to a point before the start
   * date.
   * @return A validator function that validates the end date as described above.
   */
  private getEndDateValidator(): ValidatorFn {
    return () => (this.end && this.end.value && this.start.value && isAfter(this.start.value, this.end.value) ? ({ endDate: true } as ValidationErrors) : null);
  }

  getError(fieldName: string) {
    return getFormFieldError(this.form, fieldName);
  }

  registerOnChange(fn: (value: any) => void) {
    this.form.valueChanges.subscribe(value => {
      this.onTouched();

      /* Convert the resulting value set (which will be in Date objs) to the supplied model type. */
      fn(
        this.modelType === Date
          ? value
          : {
              start: (value.start instanceof Date && SimpleDateTime.fromDate(value.start)) || null,
              end: value.end instanceof Date && SimpleDateTime.fromDate(value.end)
            }
      );
    });
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  writeValue(data: { start?: Date | SimpleDateTime; end?: Date | SimpleDateTime }) {
    /* Inbound value can be either an object of dates or an object of SimpleDateTime.  In either case, we handle data in the form as
     * Dates, as we need to apply various comparator functions against the set date. */
    this.form.patchValue(
      (data && {
        start: data.start instanceof SimpleDateTime ? data.start.toDate() : data.start,
        end: data.end instanceof SimpleDateTime ? data.end.toDate() : data.end
      }) ||
        {}
    );
  }

  validate(control: AbstractControl) {
    return this.form.valid ? null : { invalidForm: { valid: false, message: 'Form fields are invalid' } };
  }

  /**
   * @method start
   * @description
   * Accessor for the start form control.
   * @return The form control corresponding to start, should it exist.
   */
  get start(): AbstractControl | undefined {
    return this.form && this.form.get('start');
  }

  /**
   * @method end
   * @description
   * Accessor for the end form control
   * @return The form control corresponding to end, should it exist.
   */
  get end(): AbstractControl | undefined {
    return this.form && this.form.get('end');
  }
}
