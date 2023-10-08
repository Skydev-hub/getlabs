import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { format, parse } from 'date-fns';

@Component({
  selector: 'app-date-input',
  templateUrl: './date-input.component.html',
  styleUrls: ['./date-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true,
    },
  ],
  host: {
    '[class.display-inline]': 'this.displayMode === "inline"',
  },
})
export class DateInputComponent implements ControlValueAccessor {
  input: FormControl;

  @Input()
  start = new Date();

  @Input()
  displayMode: 'input' | 'inline' = 'input';

  @Input()
  modelType: Date | 'string';

  // Applies only when modelType is set to string
  @Input()
  format: string = 'yyyy-MM-dd';

  disabled: boolean = false;

  /* eslint-disable-next-line @typescript-eslint/no-empty-function */
  onTouched: () => void = () => {};

  constructor() {
    this.input = new FormControl();
  }

  registerOnChange(fn: (value: Date) => void): void {
    this.input.valueChanges.subscribe((value) => {
      /* If the model value is set to string, we will need to convert the value to a yyyy-MM-dd string. */
      fn(value && this.modelType === 'string' ? format(value, this.format) : value);
      this.onTouched();
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.input.disable();
    } else {
      this.input.enable();
    }
  }

  writeValue(date: Date | string): void {
    this.input.setValue(typeof date === 'string' ? parse(date, this.format, new Date()) : date);
  }
}
