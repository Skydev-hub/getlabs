import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MaskApplierService } from 'ngx-mask';
import { FormInputMask } from '../utils';

/**
 * Service that provides consumers the ability to create validator functions that apply a given mask.
 */
@Injectable({
  providedIn: 'root',
})
export class MaskValidatorService {
  constructor(private readonly maskService: MaskApplierService) { }

  /**
   * Creates a validation function that applies a given mask.  If the resulting validation operation fails, the validation function will return an object that contains the
   * raised error, where the key of the error flag is the validationKey (if supplied) or conformToMask (if validationKey is not supplied).
   */
  getConformsToMaskValidator(mask: FormInputMask, validationKey?: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }

      /* Apply the supplied mask against the control value, and evaluate the result */
      const maskVal = this.maskService.applyMask(String(control.value), mask.getMaskPattern());

      return mask.validate(maskVal) ? null : { [validationKey || 'conformToMask']: true }
    };
  }
}
