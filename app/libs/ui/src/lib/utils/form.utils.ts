import { HttpErrorResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { isNil } from 'lodash-es';
import { filterFalsy } from './http.utils';
import { isMatch } from 'date-fns';

export const formErrorMapping = {
  'required': 'This field is required',
  'phoneNumber': 'This field must be a valid phone number',
  'authCode': 'This field must a valid auth code',
  'email': 'This field is must be a valid email address',
  'year': 'This field must be a valid year',
  'isUniqueEmail': 'This email address is already in use',
  'isUniquePhoneNumber': 'This phone number is already in use',
  'isUniqueZipCode': 'This zip code is already in use',
  'isUniqueMarketCode': 'This market code is already in use',
  'isUniqueLabLocationAddress': 'This address is already in use',
  'zipCode': 'This field must be a valid 5 digit zip code',
  'ccNumber': 'This field must be a valid credit card number',
  'ccExpiry': 'This field must be a valid expiry date',
  'ccCVC': 'This field must be a valid CVC',
  'fileInvalid': 'This field must be a valid file',
  'fileSize': 'The file size is too big',
  'fileType': 'The file type is not allowed',
  'quizIncorrect': 'This answer to this question is incorrect',
  'age18': 'You must be at least 18 years of age',
  'age5': 'Patient must be at least 5 years of age',
  'routingNumber': 'This field must be a valid 9 digit routing number',
  'numeric': 'This field must a numeric value',
  'alphanumeric': 'This field must be an alphanumeric value',
  'endDate': 'End date must be after start date',
  'dateFormat': 'Date must be entered as MM/DD/YYYY',
  'addressAutocomplete': 'Select an address from the suggestion box',
  'invalidCouponCode': 'This is not a valid coupon code',
  'uploadInProgress': 'Upload is currently in progress...',
  'invalidDate': 'Date is not valid',
  'invalidDob': 'Date of birth is not valid',
  'placeNoZipCode': 'An address with a zip code is required'
};

/**
 * A set of pre-defined mappings that index standard human-readable characters with regex tokens.  This structure largely aligns
 * with the default patterns defined by ngx-mask, with the exception of the '1' character, which indicates a non-zero digit
 */
export const MaskRegexpMappings: { [character: string]: {
    pattern: RegExp;
    optional?: boolean;
    symbol?: string;
  }
} = {
  /* Default patterns have to be defined here - defining any custom patterns in ngx-mask results in all default patterns
   * being overwritten. */
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
  '1': { pattern: /[1-9]/ }
};

export const DateFormats = {
  MMDDYYYY: 'MM/dd/yyyy'
};

/**
 * Class that describes form input mask corresponding to a given pattern.  The pattern is supplied as an argument to the clas
 * constructor, must use the human-readable tokens defined by MaskRegexpMapping.
 */
export class FormInputMask {
  constructor(private readonly maskPattern: string) { }

  /**
   * Retrieves the human-readable mask pattern.
   */
  getMaskPattern() {
    return this.maskPattern;
  }

  /**
   * Retrieves a RegExp translation of the mask pattern represented by this instance.
   */
  getRegExp() {
    /* Convert the stored mask pattern expression to RegExp... */
    return new RegExp(Object.values(this.maskPattern).reduce((collector, char) => {
      /* If the character is defined in our MaskRegexpMappings structure, convert the character to its
       * corresponding regex representation.  Otherwise, simply provide an escaped literal of the char
       * as it's likely a 'special' character defined to be supplied as-is by ngx-mask. */
      collector += MaskRegexpMappings[char] ? MaskRegexpMappings[char].pattern.source : `\\${ char }`;
      return collector;
    }, ''));
  }

  validate(value: string): boolean {
    /* Test that the inbound value conforms to the mask regexp expression. */
    return this.getRegExp().test(value);
  }
}

/* Presently only supports date formats containing the d, M, and y tokens */
const DateTokenMaskMappings: { dateTokens: string[], maskToken: string }[] = [{
  dateTokens: ['d', 'M', 'y'],
  maskToken: '0',
}];

/**
 * Extension of FormInputMask that handles specific concerns related to validating date strings.
 */
export class DateFormInputMask extends FormInputMask {
  constructor(private readonly dateFormat: string) {
    /* Map the supplied date format to mask tokens as appropriate */
    super(Object.values(dateFormat).reduce((maskFormat, token) => {
      const mapping = DateTokenMaskMappings.find(m => m.dateTokens.includes(token));
      return maskFormat + ((mapping && mapping.maskToken) || token)
    }, ''));
  }

  /**
   * Validates the inbound value for both mask compliance and date string format validity.
   */
  public validate(value: string): boolean {
    /* Runs the parent validation method, along with domain-specific validation for dates. */
    return super.validate(value) && isMatch(value, this.dateFormat);
  }
}


export const FormInputMaskTypes = {
  phoneNumber: new FormInputMask('(100) 000-0000'),
  year: new FormInputMask('0000'),
  authCode: new FormInputMask('000000'),
  digitMask: new FormInputMask('0'),
  routingNumber: new FormInputMask('000000000'),
  date: new DateFormInputMask('MM/dd/yyyy')
};

export function markFormAsTouched(group: FormGroup | FormArray): void {
  group.markAsTouched();
  Object.keys(group.controls).map(field => {
    const control = group.get(field);
    if (control instanceof FormControl) {
      markControlAsTouched(control);
    } else if (control instanceof FormGroup || control instanceof FormArray) {
      markFormAsTouched(control);
    }
  });
}

export function markControlAsTouched(control: FormControl): void {
  control.markAsTouched({ onlySelf: true });
}

export interface ValidationErrors {
  property: string;
  constraints: { [k: string]: string }[];
  children?: ValidationErrors[];
}

export function applyNetworkValidationErrors(form: FormGroup, err: HttpErrorResponse): ValidationErrors[] {
  function applyErrors(errors: ValidationErrors[], prefix: string[] = []) {
    errors.forEach(error => {
      if (error.constraints) {
        const violations = {};
        Object.keys(error.constraints).forEach(v => (violations[error.constraints[v]] = true));
        const control = form.get([...prefix, error.property].join('.'));
        if (control) {
          control.setErrors(violations);
        }
      }
      if (error.children) {
        applyErrors(error.children, [...prefix, error.property]);
      }
    });
  }

  if (err.status === 400 && err.error && err.error.message) {
    const errors = err.error.message as ValidationErrors[];
    if (errors && errors.length > 0) {
      applyErrors(errors);
      return errors;
    }
  }

  return [];
}

export function getFormFieldError(form: FormGroup, fieldName?: string, multi?: boolean): string {
  return getFieldError(fieldName ? form.get(fieldName) : form, multi);
}

export function getFieldError(field: AbstractControl, multi?: boolean): string {
  if ((field.dirty || field.touched) && field.errors) {
    const errors = [];
    for (const error of Object.keys(field.errors)) {
      errors.push(formErrorMapping[error] || error);
    }
    return multi ? errors : errors.shift() || null;
  }
  return null;
}

export function scrollToFirstInvalidControl(element: ElementRef): void {
  const invalidControl = element.nativeElement.querySelector('.ng-invalid');
  const container = invalidControl ? invalidControl.closest('.ui-input-container') : undefined;
  (container || invalidControl || element.nativeElement).scrollIntoView({ behavior: 'smooth' });
}

/**
 * Assumes a basic error contract of { [key: string]: boolean }, where the boolean value indicates whether or not an
 * error is present (true = error present, false = error not present).
 *
 * This is the basic contract indicated by Angular for form control validation errors, which is criminally
 * underdocumented.
 */
export function filterErrors(errors: { [key: string]: boolean }) {
  /* Remove all falsy values from the inbound object (only values marked as truthy are considered errors) */
  errors = filterFalsy(errors);

  /* If the resulting object has no keys, then return null (validator interface requires null to certify no errors
   * are present within a given form control). */
  return Object.keys(errors).length ? errors : null;
}

/**
 * Determines if the supplied form object represents a form that is partially complete.  In order for a form to be
 * considered partially complete, it must have at least one non-nil/non-blank string value, and at least one nil/
 * blank string value.
 */
export function isPartiallyComplete(form: FormGroup | FormArray) {
  /* Cycle through the control values for each item in the supplied form - if we have at least one nil field, and at least
   * one non-nil field, that means we have a partially completed form. */
  const allControls = Object.values(form.controls);
  const completedControls = allControls.filter(control => !isNil(control.value) && control.value !== '');

  return !!completedControls.length && completedControls.length < allControls.length;
}
