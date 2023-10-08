import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { parse } from 'date-fns';

@Component({
  selector: 'app-dob-input',
  templateUrl: './dob-input.component.html',
  styleUrls: ['./dob-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DobInputComponent),
      multi: true,
    }
  ]
})
export class DobInputComponent implements ControlValueAccessor {

  input: FormControl;

  @Input()
  min = new Date(1900, 0, 1);

  // Can't be born in the future, or can you? This should probably impose some sort
  // of age restriction... being born yesterday doesn't make much sense either.
  @Input()
  max = new Date();

  // Date components shows +-10 years, so 1980 is a good middle ground to start at
  @Input()
  start = new Date(1980, 0, 1);

  disabled: boolean = false;

  private onTouched: () => void = () => {};

  constructor() {
    this.input = new FormControl();
  }

  registerOnChange(fn: (value: Date) => void): void {
    this.input.valueChanges.subscribe(fn);
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

  writeValue(date: Date): void {
    this.input.setValue(date);
  }

  /**
   * @description
   * Intended to intercept the autofill event, which is not an instance of FocusEvent.  Whenever an autofill event fires, we will ignore the default behaviour so that the
   * datepicker window does not open.
   * @return True if this invocation did not identify the autofill event, false if it did.
   */
  interceptAutofill(event: Event): boolean {
    /* If the event is not of type FocusEvent, then this event was spawned by an autocomplete action. */
    if (!(event instanceof FocusEvent)) {
      event.preventDefault();
      return false;
    }

    return true;
  }

  /**
   * @description
   * Autofill will fire an input event as well.  If it does, we need to intercept the string value and massage it into a Date.
   */
  doAutofill(event: Event) {
    /* If the event is of type CustomEvent, then we know that this event was triggered by an autofill - in that case, we will need to use date-fns to format the inbound date. */
    const invalid = new Date();
    let val = parse((event.target as any).value, 'yyyy-MM-dd', invalid);

    /* If the above format did not evaluate to a value, attempt using / instead.  Unfortunately we cannot infer formats any more, as that functionality is deprecated. */
    if (val === invalid) {
      val = parse((event.target as any).value, 'yyyy/MM/dd', invalid);
    }

    this.writeValue(val !== invalid ? val : null);
  }

}
