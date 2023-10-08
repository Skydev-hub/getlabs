import { AbstractControl } from '@angular/forms';

/**
 * Validates that at least one property in the control's value is in compliance with the supplied predicate.
 * The predicate will be invoked for each object property- both objects and arrays are supported.
 * This is akin to Array.prototype.some...
 */
export function SomeValidator<T = any>(predicate: (value: T) => boolean, validationKey = 'some') {
  return (control: AbstractControl): { [key: string]: any } | null => {
    /* If the control doesn't exist, return null. */
    if (!control) {
      return null;
    }

    /* Iterate through each indexed value in the supplied form control's rx value */
    return !!Object.keys(control.value || []).find(key => predicate(control.value[key])) ?
      null : { [validationKey]: true };
  }
}
