import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators } from '@angular/forms';
import { PatientUser, CreditEntity, CreditSourceEnum, CreditSourceLabels, applyNetworkValidationErrors, getFormFieldError } from '@app/ui';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PatientCreditService } from '../../../../shared/services/patient-credit.service';
import { CreditComponent } from '../abstract-credit.component';

@Component({
  selector: 'app-issue-credit',
  templateUrl: './issue-credit.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IssueCreditComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IssueCreditComponent),
      multi: true,
    }
  ]
})
export class IssueCreditComponent implements ControlValueAccessor, Validator, CreditComponent<CreditEntity>, OnDestroy {
  @Input()
  public recipient: PatientUser;

  public readonly formGroup: FormGroup;

  private onTouched: () => void;

  private onChangeSub: Subscription;

  constructor(fb: FormBuilder, private readonly patientCreditService: PatientCreditService) {
    this.formGroup = fb.group({
      source: [null, Validators.required],
      amount: [null, Validators.required],
      notes: [null, () => this.source === CreditSourceEnum.Other],
    });
  }

  public CreditSources = CreditSourceEnum;

  public getLabel(creditSource: CreditSourceEnum) {
    return CreditSourceLabels[creditSource];
  }

  public get source(): CreditSourceEnum {
    return this.formGroup && this.formGroup.get('source').value;
  }

  writeValue(obj: any): void {
    this.formGroup.patchValue({
      ...obj,
      amount: (obj && typeof obj.amount === 'number' && obj.amount * 100) || undefined,
    });
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public registerOnChange(fn: any): void {
    this.onChangeSub = this.formGroup.valueChanges.subscribe(value => fn(value));
  }

  public validate() {
    return this.formGroup.valid ? null : { invalidForm: { valid: false, message: 'Form fields are invalid' } };
  }

  confirmCreditOperation() {
    if (this.formGroup.valid) {
      /* Start an API invocation that will give the credit specified by the current state of the form to the indicated recipient. */
      return this.patientCreditService.issueCredit(
        this.recipient,

        /* Credits are tracked as integers in total number of cents */
        this.formGroup.value.amount * 100,
        this.formGroup.value.source,
        this.formGroup.value.source === CreditSourceEnum.Other ? this.formGroup.value.notes : undefined,
      ).pipe(
        catchError(err => {
          applyNetworkValidationErrors(this.formGroup, err);
          return this._getExceptionObservable(err, 'backend');
        })
      );
    }

    /* If we get here, the form is invalid.  Throw an exception in the observable pipeline. */
    return this._getExceptionObservable(this.formGroup.errors, 'validation');
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.formGroup, fieldName);
  }

  private _getExceptionObservable(err: any, type: 'validation' | 'backend') {
    return throwError({
      type,
      errorDetails: err,
    });
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }
}
