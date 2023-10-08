import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { applyNetworkValidationErrors, AppointmentEntity, getFormFieldError, markFormAsTouched } from '@app/ui';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../../../shared/services/appointment.service';
import { AppointmentRefundDialogData } from './appointment-refund-dialog-data.interface';


@Component({
  templateUrl: './appointment-refund-dialog.component.html',
  styleUrls: ['./appointment-refund-dialog.component.scss']
})
export class AppointmentRefundDialogComponent implements OnInit {

  public form: FormGroup;

  reasons: string[] = [
    'Support mistake',
    'Specialist mistake',
    'Getlabs exception',
    'Patient emergency',
    'Specialist emergency',
    'Duplicate appointment',
  ];

  reqSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppointmentRefundDialogData,
    public dialogRef: MatDialogRef<AppointmentRefundDialogComponent>,
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

  refund() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      this.reqSub = this.service.refund(
        this.data.appointment.id,
        model.reason === 'other' ? model.note : model.reason
      ).subscribe(
        payment => this.dialogRef.close(payment),
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        }
      );
    }
  }

}
