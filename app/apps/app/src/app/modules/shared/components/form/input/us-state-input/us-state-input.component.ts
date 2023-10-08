import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { USStates } from '../../../../utils/us-states.data';

@Component({
  selector: 'app-us-state-input',
  templateUrl: './us-state-input.component.html',
  styleUrls: ['./us-state-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => USStateInputComponent),
      multi: true,
    }
  ]
})
export class USStateInputComponent implements ControlValueAccessor {

  input: FormControl;

  disabled: boolean = false;

  states = USStates;

  private onTouched: () => void = () => {};

  constructor() {
    this.input = new FormControl();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.input.valueChanges.subscribe((v) => {
      fn(v);
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: string): void {
    this.input.setValue(value);
  }

}
