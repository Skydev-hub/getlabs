import { AbstractControl, ValidatorFn } from '@angular/forms';

export function NumberRangeValidator(min: number, max: number, errorMsg?: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const valid = !isNaN(min) && !isNaN(max) && control.value >= min && control.value <= max;
    return valid ? null : { [errorMsg || 'numberRange']: true };
  };
}
