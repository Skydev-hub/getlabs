import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isValid } from 'date-fns';
import { isAfterDay } from '../utils/date.utils';

export function MinDateValidator(date: Date, errorMsg?: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value || (control.value instanceof Date && !isValid(control.value))) {
      return null;
    }

    if (!(control.value instanceof Date)) {
      throw new TypeError('Control value must be an instance of Date');
    }

    return isAfterDay(control.value, date) ? null : { [errorMsg || 'invalidDate']: true };
  };
}
