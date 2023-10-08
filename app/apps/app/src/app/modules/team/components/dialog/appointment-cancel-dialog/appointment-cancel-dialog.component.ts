import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  applyNetworkValidationErrors,
  AppointmentCancelReason,
  AppointmentCancelReasonLabels,
  AppointmentEntity,
  AppointmentStatus,
  getFormFieldError,
  markFormAsTouched
} from '@app/ui';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../../shared/services/appointment.service';
import { AppointmentCancelDialogData } from './appointment-cancel-dialog-data.interface';


@Component({
  templateUrl: './appointment-cancel-dialog.component.html',
  styleUrls: ['./appointment-cancel-dialog.component.scss']
})
export class AppointmentCancelDialogComponent implements OnInit {

  public form: FormGroup;

  Status = AppointmentStatus;
  CancelReason = AppointmentCancelReason;
  CancelReasonLabel = AppointmentCancelReasonLabels;

  reqSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppointmentCancelDialogData,
    public dialogRef: MatDialogRef<AppointmentCancelDialogComponent>,
    private fb: FormBuilder,
    private service: AppointmentService,
  ) {
    this.form = fb.group({
      reason: [null, Validators.required],
      note: [],
    });

    const note = this.form.get('note');

    this.form.get('reason').valueChanges.subscribe((value: string) => {
      if (value === 'other') {
        note.setValidators([Validators.required]);
      } else {
        note.setValidators([]);
      }
      note.updateValueAndValidity();
    });

  }

  ngOnInit(): void {
    if (!(this.data.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The property \'appointment\' must be an instance of AppointmentEntity');
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  cancel() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      this.reqSub = this.service.cancel(
        this.data.appointment.id,
        model.reason,
        model.reason === 'other' ? model.note : undefined
      ).subscribe(
        appointment => this.dialogRef.close(appointment),
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        }
      );
    }
  }

}
