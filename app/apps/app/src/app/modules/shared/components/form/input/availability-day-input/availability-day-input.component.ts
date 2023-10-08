import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { isAfter, isBefore, parse as parseDate } from 'date-fns';
import { get } from 'lodash-es';
import { OperatingHours, ScheduleDay } from '@app/ui';

@Component({
  selector: 'app-availability-day-input',
  templateUrl: './availability-day-input.component.html',
  styleUrls: ['./availability-day-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvailabilityDayInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AvailabilityDayInputComponent),
      multi: true,
    }
  ]
})
export class AvailabilityDayInputComponent implements OnInit, ControlValueAccessor, Validator {

  @Input()
  public label;

  public form: FormGroup;

  timeOptions: string[] = ['05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'/*, '17:00'*/];

  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      enabled: [true],
      ranges: fb.array([])
    });
  }

  ngOnInit() {
  }

  get ranges(): FormArray {
    return this.form.get('ranges') as FormArray;
  }

  addRange() {
    this.ranges.push(this.createRange());
  }

  removeRange(index: number) {
    this.ranges.removeAt(index);
  }

  registerOnChange(fn: (day: Partial<ScheduleDay>) => void): void {
    this.form.valueChanges.subscribe(data => fn({
      disabled: !data.enabled,
      hours: data.ranges,
    }));
  }

  registerOnTouched(fn: any): void {

  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  writeValue(data?: ScheduleDay): void {
    this.form.patchValue({
      enabled: data ? data.enabled : true,
    });

    if (data) {
      this.ranges.clear();
      if (Array.isArray(data.hours)) {
        data.hours.forEach(hours => this.ranges.push(this.createRange(hours)));
      }
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.form.valid ? null : { invalidForm: { valid: false, message: 'Form fields are invalid' } };
  }

  convertTimeToDate(time: string): Date {
    return parseDate(time, 'HH:mm', new Date());
  }

  getStartTimeOptions(index: number): string[] {
    const end = this.ranges.at(index).value.end;
    return this.timeOptions.filter(value => !end || isBefore(this.convertTimeToDate(value), this.convertTimeToDate(end)));
  }

  getEndTimeOptions(index: number): string[] {
    const start = this.ranges.at(index).value.start;
    return this.timeOptions.filter(value => !start || isAfter(this.convertTimeToDate(value), this.convertTimeToDate(start)));
  }

  // ---

  private createRange(data?: OperatingHours): FormGroup {
    return this.fb.group({
      start: [get(data, 'start', '06:00')],
      end: [get(data, 'end', '14:00')],
    });
  }

}
