import { AbstractControl, ValidatorFn } from '@angular/forms';
import {differenceInYears, isValid} from 'date-fns';

export function AgeValidator(age: number, errorMsg?: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value || (control.value instanceof Date && !isValid(control.value))) {
      return null;
    }

    if (!(control.value instanceof Date)) {
      throw new TypeError('Control value must be an instance of Date');
    }

    return differenceInYears(new Date(), control.value) >= age ? null : { [errorMsg || 'age']: true };
  };
}
