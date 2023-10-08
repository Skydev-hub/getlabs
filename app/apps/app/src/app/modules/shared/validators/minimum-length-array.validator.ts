import { AbstractControl, ValidatorFn } from '@angular/forms';

export function MinimumLengthArrayValidator(min: number, errorMsg?: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (Array.isArray(control.value) && control.value.length >= min) {
      return null;
    }

    return { [errorMsg || 'minLengthArray']: true };
  };
}
