import { Inject, Directive } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe, PatientUser } from '@app/ui';
import { CreditComponent } from './abstract-credit.component';
import { isNil } from 'lodash-es';

export interface CreditDialogData {
  recipient: PatientUser;
}

export interface CreditDialogComponent<T> {
  formControl: FormControl;
  recipient: PatientUser;
  confirmCreditOperation: () => void;
}

@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix */
export abstract class AbstractCreditDialogComponent<T> implements CreditDialogComponent<T> {
  public readonly formControl = new FormControl();

  public readonly recipient: PatientUser;

  constructor(private readonly dialogRef: MatDialogRef<AbstractCreditDialogComponent<T>>, @Inject(MAT_DIALOG_DATA) public data: CreditDialogData) {
    this.recipient = data.recipient;
  }

  confirmCreditOperation() {
    if (this.formControl.valid) {
      /* Disposition the dialog with the indicated result upon success... */
      this.getFormComponent()
        .confirmCreditOperation()
        .subscribe(AutoUnsubscribe((result) => this.dialogRef.close(isNil(result) ? true : result)));
    }
  }

  abstract getFormComponent(): CreditComponent<T>;
}
