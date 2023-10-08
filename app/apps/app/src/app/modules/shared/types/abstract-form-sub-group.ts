import { Input, Directive } from '@angular/core';
import { ControlContainer, FormArray, FormGroup } from '@angular/forms';
import { FormGroupControl } from './form-group-control';

/**
 * @description
 * AbstractFormSubGroup is an abstract type from which components for reusable forms that are entirely contained may be derived.  This class permits reusable form components the
 * ability to link the state of their form controls with that of the parent form.
 */
@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix */
export abstract class AbstractFormSubGroup {
  @Input()
  formControlName: string;

  /**
   * Constructor performs no actions
   * @param container The ControlContainer (i.e. form group element) of the parent form that owns the instance of the derived type.
   */
  protected constructor(private container: ControlContainer) {}

  /**
   * @description
   * Registers the supplied form with the form control that represents it in the parent form.
   * @param formGroup The form to register as described above.
   */
  registerSubForm(formGroup: FormGroup | FormArray): void {
    /* ControlContainer is optional on some sub-components - if container is not present, return immediately and take no action. */
    if (!this.container) {
      return;
    }

    /* Resolve the control that represents the abstracted version of this form in the parent form. */
    const control = this.container.control.get(this.formControlName);

    /* If the control is an instance of FormGroupControl, register the subgroup now. */
    if (control instanceof FormGroupControl) {
      control.registerGroup(formGroup);
    }
  }
}
