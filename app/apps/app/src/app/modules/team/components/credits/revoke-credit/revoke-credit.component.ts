import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { applyNetworkValidationErrors, getFormFieldError, PatientUser } from '@app/ui';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PatientCreditService } from '../../../../shared/services/patient-credit.service';
import { CreditComponent } from '../abstract-credit.component';

@Component({
  selector: 'app-revoke-credit',
  templateUrl: './revoke-credit.component.html'
})
export class RevokeCreditComponent implements CreditComponent<void> {
  @Input()
  public recipient: PatientUser;

  public formGroup: FormGroup;

  constructor(formBuilder: FormBuilder, private readonly patientCreditService: PatientCreditService) {
    this.formGroup = formBuilder.group({
      amount: [null, Validators.required]
    });
  }

  confirmCreditOperation() {
    /* Credit amounts are expressed as integers in cents */
    return this.patientCreditService.revokeCredit(this.recipient, this.formGroup.value.amount * 100).pipe(
      catchError(err => {
        applyNetworkValidationErrors(this.formGroup, err);
        return throwError(err);
      })
    );
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.formGroup, fieldName);
  }
}
