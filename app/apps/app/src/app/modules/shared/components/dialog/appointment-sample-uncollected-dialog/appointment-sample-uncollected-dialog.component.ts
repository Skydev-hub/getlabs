import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  applyNetworkValidationErrors,
  AppointmentSampleUncollectedReason,
  AppointmentSampleUncollectedReasonLabels,
  enumValues,
  getFormFieldError,
  markFormAsTouched,
} from '@app/ui';
import { Subscription } from 'rxjs';
import { AppointmentSampleService } from '../../../services/appointment-sample.service';
import { AppointmentSampleUncollectedDialogData } from './appointment-sample-uncollected-dialog-data.interface';

@Component({
  templateUrl: './appointment-sample-uncollected-dialog.component.html',
  styleUrls: ['./appointment-sample-uncollected-dialog.component.scss'],
})
export class AppointmentSampleUncollectedDialogComponent implements OnInit {
  public form: FormGroup;

  req$: Subscription;

  reasons: string[] = [...enumValues(AppointmentSampleUncollectedReason)];

  Reasons = AppointmentSampleUncollectedReasonLabels;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppointmentSampleUncollectedDialogData,
    public dialogRef: MatDialogRef<AppointmentSampleUncollectedDialogComponent>,
    private fb: FormBuilder,
    private service: AppointmentSampleService
  ) {
    this.form = fb.group({
      uncollectedReason: [null, Validators.required],
      uncollectedNote: [],
    });

    const note = this.form.get('uncollectedNote');

    this.form.get('uncollectedReason').valueChanges.subscribe((value: string) => {
      if (value === AppointmentSampleUncollectedReason.Other) {
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
          uncollectedReason: model.uncollectedReason,
          uncollectedNote: model.uncollectedReason === 'other' ? model.uncollectedNote : undefined,
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
