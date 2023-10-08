import { AbstractControl, ValidatorFn } from '@angular/forms';

export function RegexValidator(regex: RegExp, errorMsg: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    const valid = regex.test(control.value);
    return valid ? null : { [errorMsg]: true };
  };
}
