import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { markFormAsTouched } from '@app/ui';

/**
 * @description
 * FormGroupControl is an extended subtype of FormControl that contains considerations for representing embedded forms.  Generally, in reactive forms, the form field structure of
 * a given subform in the parent form will be hidden behind the FormControl object that represents it.  This presents various problems when we need to link the state of the
 * parent form to that of the child form.  This subtype bridges this gap by implementing considerations that manage this relationship.
 */
export class FormGroupControl extends FormControl {
  private formGroup: FormGroup | FormArray;

  /**
   * @method registerGroup
   * @description
   * Registers the supplied form group with this control.
   * @param formGroup The form group to register with this control instance.
   */
  registerGroup(formGroup: FormGroup | FormArray): void {
    this.formGroup = formGroup;
  }

  /**
   * @method markAsTouched
   * @description
   * Override of FormControl#markAsTouched - calls the super class' implementation of markAsTouched, and then invokes markFormAsTouched on the sub form registered with this
   * control instance.
   * @param opts Options for the behaviour of this method (see @FormControl.markAsTouched)
   */
  markAsTouched(opts?: { onlySelf?: boolean }): void {
    super.markAsTouched(opts);

    /* Invoke the touched listener of the group abstracted behind this control. */
    markFormAsTouched(this.formGroup);
  }
}
