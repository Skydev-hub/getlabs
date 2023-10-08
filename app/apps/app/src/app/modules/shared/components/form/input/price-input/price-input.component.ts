import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-price-input',
  templateUrl: './price-input.component.html',
  styleUrls: ['./price-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PriceInputComponent),
      multi: true,
    },
  ],
})
export class PriceInputComponent implements ControlValueAccessor {

  input: FormControl;

  disabled: boolean = false;

  private onTouched: () => void = () => {
  };

  constructor() {
    this.input = new FormControl();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.input.valueChanges.subscribe((v) => {
      fn(((Number(v) || 0) * 100).toFixed(0));
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: string | number): void {
    this.input.setValue(((Number(value) || 0) / 100).toFixed(2));
  }

}
