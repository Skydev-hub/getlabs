import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  applyNetworkValidationErrors,
  AppointmentSampleUnprocessedReason,
  AppointmentSampleUnprocessedReasonLabels,
  enumValues,
  getFormFieldError,
  markFormAsTouched,
} from '@app/ui';
import { Subscription } from 'rxjs';
import { AppointmentSampleService } from '../../../services/appointment-sample.service';
import { AppointmentSampleUnprocessedDialogData } from './appointment-sample-unprocessed-dialog-data.interface';

@Component({
  templateUrl: './appointment-sample-unprocessed-dialog.component.html',
  styleUrls: ['./appointment-sample-unprocessed-dialog.component.scss'],
})
export class AppointmentSampleUnprocessedDialogComponent implements OnInit {
  public form: FormGroup;

  req$: Subscription;

  reasons: string[] = [...enumValues(AppointmentSampleUnprocessedReason)];

  Reasons = AppointmentSampleUnprocessedReasonLabels;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppointmentSampleUnprocessedDialogData,
    public dialogRef: MatDialogRef<AppointmentSampleUnprocessedDialogComponent>,
    private fb: FormBuilder,
    private service: AppointmentSampleService
  ) {
    this.form = fb.group({
      unprocessedReason: [null, Validators.required],
      unprocessedNote: [],
    });

    const note = this.form.get('unprocessedNote');

    this.form.get('unprocessedReason').valueChanges.subscribe((value: string) => {
      if (value === AppointmentSampleUnprocessedReason.Other) {
        note.setValidators([Validators.required]);
      } else {
        note.setValidators([]);
      }
      note.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    if (!this.data.sample) {
      throw new TypeError("The 'sample' data property is required");
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  save() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      this.req$ = this.service
        .update(this.data.sample.id, {
          unprocessedReason: model.unprocessedReason,
          unprocessedNote: model.unprocessedReason === 'other' ? model.unprocessedNote : undefined,
        })
        .subscribe(
          (sample) => this.dialogRef.close(sample),
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }
}
