import { Component, forwardRef } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MaskValidatorService } from '../../services/mask-validator.service';
import { FormInputMaskTypes } from '../../utils/form.utils';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor, Validator {

  input: FormControl;

  disabled: boolean = false;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  private onTouched: () => void = () => {};

  constructor(private readonly maskValidatatorService: MaskValidatorService) {
    this.input = new FormControl(null, [
      this.maskValidatatorService.getConformsToMaskValidator(this.phoneNumberMask, 'phoneNumber')
    ]);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.input.valueChanges.subscribe(fn);
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

  validate(control: AbstractControl): ValidationErrors | null {
    return this.input.errors;
  }

}
