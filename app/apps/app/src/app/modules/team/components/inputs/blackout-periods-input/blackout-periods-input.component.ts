import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  Validator
} from '@angular/forms';
import { BlackoutPeriod, getFormFieldError, SimpleDateTime } from '@app/ui';
import { AbstractFormSubGroup } from '../../../../shared/types/abstract-form-sub-group';
import { FormGroupControl } from '../../../../shared/types/form-group-control';

@Component({
  selector: 'app-team-blackout-periods-input',
  templateUrl: './blackout-periods-input.component.html',
  styleUrls: ['./blackout-periods-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BlackoutPeriodsInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => BlackoutPeriodsInputComponent),
      multi: true
    }
  ]
})
export class BlackoutPeriodsInputComponent extends AbstractFormSubGroup implements OnInit, ControlValueAccessor, Validator {
  public form: FormGroup;

  /**
   * If provided, all times displayed through this control will be rendered in this timezone.  Note that
   * all values will automatically be translated into UTC before cascading time resulting Date value
   * back to the bound control, so there is no need for the consumer of this component to convert back
   * to UTC on their own.
   */
  @Input()
  timezone: string;

  SimpleDateTime = SimpleDateTime;

  private onTouched: () => void = () => {};

  constructor(private fb: FormBuilder, private c: ControlContainer) {
    super(c);
    this.form = fb.group({
      ranges: fb.array([])
    });
  }

  ngOnInit() {
    this.registerSubForm(this.form);
  }

  get ranges(): FormArray {
    return this.form.get('ranges') as FormArray;
  }

  addRange() {
    this.ranges.push(this.createRange());

    /* Forces the parent to update value/validity when a new item is added. */
    setTimeout(() => this.form.updateValueAndValidity());
  }

  removeRange(index: number) {
    this.ranges.removeAt(index);
  }

  getError(fieldName: string) {
    return getFormFieldError(this.form, fieldName);
  }

  registerOnChange(fn: (value: any) => void) {
    this.form.valueChanges.subscribe(data => fn(data.ranges.filter(Boolean)));
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

  writeValue(data: BlackoutPeriod[]) {
    this.ranges.clear();
    if (Array.isArray(data)) {
      data.forEach(range => {
        this.ranges.push(this.createRange(range));
      });
    }
  }

  validate(control: AbstractControl) {
    return this.form.valid ? null : { invalidForm: { valid: false, message: 'Form fields are invalid' } };
  }

  // ---

  private createRange(data?: BlackoutPeriod): FormGroupControl {
    return new FormGroupControl(data || new BlackoutPeriod());
  }
}
