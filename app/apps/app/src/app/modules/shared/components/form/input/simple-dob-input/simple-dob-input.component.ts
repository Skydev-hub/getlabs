import { Component, forwardRef } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator
} from '@angular/forms';
import { DateFormats, FormInputMaskTypes, MaskValidatorService } from '@app/ui';
import { format, parse } from 'date-fns';

@Component({
  selector: 'app-simple-dob-input',
  templateUrl: './simple-dob-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SimpleDobInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SimpleDobInputComponent),
      multi: true,
    }
  ]
})
export class SimpleDobInputComponent implements ControlValueAccessor, Validator {
  public dobMask = FormInputMaskTypes.date;

  public input: FormControl;

  public onTouched: () => void;

  constructor(private readonly maskValidatorService: MaskValidatorService) {
    this.input = new FormControl(null, {
      validators: this.maskValidatorService.getConformsToMaskValidator(this.dobMask, 'dateFormat'),
      updateOn: 'blur'
    });
  }

  writeValue(dob: Date): void {
    /* Whenever we receive changes, update the input value accordingly.  Date may be received as either a string or
     * a date.  Value will always be exported as a date. */
    this.input.setValue((dob instanceof Date && format(dob, DateFormats.MMDDYYYY)) || '');
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: (val) => void): void {
    /* Subscribe to changes to the input field - whenever these values change, update the tracked birth date accordingly... */
    this.input.valueChanges.subscribe(newVal => {
      /* Translate the updated value to a Date object... */
      const date = newVal ? parse(newVal, DateFormats.MMDDYYYY, new Date()) : null;
      fn(date);
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.input.errors && Object.keys(this.input.errors).filter(Boolean).length ? this.input.errors : null;
  }
}
