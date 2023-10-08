import { Directive, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { distinctUntilKeyChanged, filter } from 'rxjs/operators';

export enum FormSectionVisibilityType {
  Full,
  Short,
  None,
}

export interface FormSectionVisibility {
  [key: string]: FormSectionVisibilityType;
}

/* Not possible to define generics only on the level of a member function that would be supplied by the implementation - Bart,
 * please do correct me if I'm wrong, I would love it if this was possible. */
export interface FormFieldShape<T = any, R = T> {
  fieldDef: any[];
  visibility?: FormSectionVisibilityType;
  transient?: boolean;
  export?: (formVal: T) => R;
  [key: string]: any;
}

export interface FormSectionShape {
  [key: string]: FormFieldShape;
}

export interface FormShape {
  [key: string]: FormSectionShape;
}

@Directive({
  selector: '[appFormContainer]',
})
export class FormContainerDirective implements OnInit, OnDestroy {
  @Input('appFormContainer')
  public set form(formGroup: FormGroup) {
    this.form$.next(formGroup);
  }

  public get form() {
    return this.form$.value;
  }

  @Input()
  public hideDisabled = false;

  @Input()
  set formShape(formShape: FormShape) {
    this._formShape = formShape;

    /* Whenever the form shape is set, and the form object is not already provided, construct the form automatically. */
    if (this._formShape) {
      this.form = this.getForm();
      this.initForm.emit(this.form);
    }
  }

  get formShape() {
    return this._formShape;
  }

  @Output()
  public initForm = new EventEmitter<FormGroup>(true);

  @Input()
  get sections() {
    return this._sections$.value;
  }

  set sections(sections: FormSectionVisibility) {
    this._sections$.next(sections);
  }

  private _formShape: FormShape;

  private _sections$ = new BehaviorSubject<FormSectionVisibility>(null);

  private form$: BehaviorSubject<FormGroup> = new BehaviorSubject<FormGroup>(null);

  private subscription: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    /* Form and sections are both asynchronous properties - if we are provided a sections property, we will need to alter fields on the
     * existing form object accordingly. */
    this.subscription = combineLatest([
      /* Ignore all null emissions - we can't perform any operations of particular value whenever these subjects emit null */
      this._sections$.asObservable().pipe(filter((val) => !!val)),
      this.form$.asObservable().pipe(filter((val) => !!val)),
    ])
      .pipe(
        /* Ensures that the subscription method does not run until both section and form are available while only responding to future
         * changes to section. */
        distinctUntilKeyChanged(0, (oldVal, newVal) => isEqual(oldVal, newVal))
      )
      .subscribe(([sections, form]) => {
        /* If the inbound value is empty / not defined, use the full set of profile sections. */
        // const newSections: FormSectionVisibility = sections || {};
        sections = sections || {};

        /* Compare the current state of defined sections to the new inbound state - if there are differences, we will need to
         * update the state of validators accordingly. */
        // if (!isEqual(this.sections, newSections)) {
        Object.keys(sections).forEach((sectionKey) => {
          /* Validation must be enabled for all sections and fields that are rendered; validation must be disabled for all
           * sections and fields that are not rendered. */
          if (sections[sectionKey] === FormSectionVisibilityType.Short) {
            /* Short form case - we'll need to cycle through each corresponding group property, and enable/disable
             * validation accordingly. */
            const formGroup = form.get(sectionKey);

            Object.keys(this._formShape[sectionKey]).forEach((fieldKey) => {
              const field = formGroup.get(fieldKey);

              /* For all fields marked as the 'short' vis type, enable.  Otherwise, for all other fields disable. */
              this._formShape[sectionKey][fieldKey].visibility === FormSectionVisibilityType.Short ? field.enable() : field.disable();
            });
          } else {
            /* Long form / no display case - we can enable/disable form fields at the group level. */
            sections[sectionKey] === FormSectionVisibilityType.Full ? form.get(sectionKey).enable() : form.get(sectionKey).disable();
          }
        });
        // }
      });
  }

  public isRequired(name: string) {
    let isRequired = false;

    try {
      /* Retrieve the set of validators that belong to the requested form control */
      const control = this.findControl(name.split('.'), this.form);
      const validators = (control.validator && control.validator({} as AbstractControl)) || {};

      /* If this set of validators includes 'required', then this field is required. */
      isRequired = Object.keys(validators).includes('required');
    } catch (err) {
      console.warn(`Unable to resolve required status of the supplied field ${name} due to an exception: ${err}`);
    }

    return isRequired;
  }

  public isHideDisabled() {
    return this.hideDisabled;
  }

  public isDisabled(name: string) {
    const control = this.findControl(name.split('.'), this.form);
    return control && control.disabled;
  }

  public getControl(name: string) {
    return this.findControl(name.split('.'), this.form);
  }

  public getForm() {
    return this.fb.group(
      Object.keys(this._formShape).reduce((obj, formGroupKey) => {
        /* Add this sub-group's contents to the form object. */
        obj[formGroupKey] = this.fb.group(
          Object.keys(this._formShape[formGroupKey]).reduce((formDefObj, fieldKey) => {
            formDefObj[fieldKey] = this._formShape[formGroupKey][fieldKey].fieldDef;
            return formDefObj;
          }, {})
        );
        return obj;
      }, {})
    );
  }

  private findControl(_name: string[], form: FormGroup | FormArray): AbstractControl {
    /* Find the form control referenced by the first part of the name array. */
    const control = form.get(_name[0]);

    /* If the supplied control cannot be found, or the supplied name indicates a nested control that is not a parent form group,
     * we will need to indicate an exception. */
    if (!control || (_name.length > 1 && !(control instanceof FormGroup || control instanceof FormArray))) {
      throw new Error(`Cannot resolve the form control referenced by the supplied path. Control resolves to => ${control}
                             which is of type ${typeof control};${_name.length > 1 ? '(FormGroup / FormArray expected.)' : ''} 
                             current recursive iteration path => ${_name.toString()}`);
    }

    return _name.length > 1 ? this.findControl(_name.slice(1), control as FormGroup | FormArray) : control;
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
