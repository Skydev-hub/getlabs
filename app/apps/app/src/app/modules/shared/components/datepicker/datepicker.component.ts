import { Component, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
})
export class DatepickerComponent implements ControlValueAccessor, Validator {
  @ViewChild(MatDatepicker, { static: true })
  _datePicker: MatDatepicker<Date>;

  formControl: FormControl = new FormControl();

  open() {
    this._datePicker.open();
  }

  validate() {
    return null;
  }

  registerOnChange(fn: any): void {
    this.formControl.valueChanges.subscribe((date) => fn(date));
  }

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  registerOnTouched(fn: any): void {}

  writeValue(obj: Date): void {
    /* Set the current value of the datepicker to the supplied date. */
    this.formControl.setValue(obj, { emitEvent: false });
  }
}
