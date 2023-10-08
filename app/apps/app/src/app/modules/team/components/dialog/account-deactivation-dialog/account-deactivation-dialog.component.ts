import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { applyNetworkValidationErrors, getFormFieldError, markFormAsTouched, UserService } from '@app/ui';
import { Subscription } from 'rxjs';
import { AccountDeactivationDialogData } from './account-deactivation-dialog-data.interface';


@Component({
  templateUrl: './account-deactivation-dialog.component.html',
  styleUrls: ['./account-deactivation-dialog.component.scss'],
})
export class AccountDeactivationDialogComponent implements OnInit {

  public form: FormGroup;

  reqSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AccountDeactivationDialogData,
    public dialogRef: MatDialogRef<AccountDeactivationDialogComponent>,
    private fb: FormBuilder,
    private service: UserService,
  ) {
    this.form = fb.group({
      deactivationReason: [null, Validators.required],
      deactivationNote: [],
    });

    const note = this.form.get('deactivationNote');

    this.form.get('deactivationReason').valueChanges.subscribe((value: string) => {
      if (value === 'other') {
        note.setValidators([Validators.required]);
      } else {
        note.setValidators([]);
      }
      note.updateValueAndValidity();
    });

  }

  ngOnInit(): void {
    if (!this.data.user) {
      throw new TypeError('The \'user\' data property is required');
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  deactivate() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      this.reqSub = this.service.getService(this.data.user.getUserType()).update(
        this.data.user.id,
        {
          deactivationDate: new Date(),
          deactivationReason: model.deactivationReason,
          deactivationNote: model.deactivationReason === 'other' ? model.deactivationNote : undefined,
        },
      ).subscribe(
        user => this.dialogRef.close(user),
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        },
      );
    }
  }

}
