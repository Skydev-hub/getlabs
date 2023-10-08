import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { applyNetworkValidationErrors, AppointmentEntity, getFormFieldError, markFormAsTouched, SpecialistUser, SpecialistUserService, X_HEADER_MARKETS } from '@app/ui';
import { AppointmentService } from 'apps/app/src/app/modules/shared/services/appointment.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AssignSpecialistDialogData {
  appointment: AppointmentEntity;
}

@Component({
  templateUrl: './assign-specialist-dialog.component.html',
  styleUrls: ['./assign-specialist-dialog.component.scss'],
})
export class AssignSpecialistDialogComponent implements OnInit {

  public form: FormGroup;

  specialists$: Observable<SpecialistUser[]>;

  req$: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AssignSpecialistDialogData,
    public dialogRef: MatDialogRef<AssignSpecialistDialogComponent>,
    private fb: FormBuilder,
    private specialists: SpecialistUserService,
    private appointments: AppointmentService,
  ) {
    this.form = fb.group({
      specialist: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!(this.data.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The \'appointment\' data property must be an instance of AppointmentEntity');
    }

    this.specialists$ = this.specialists.list(
      {
        limit: '100', // TODO: This code should actually fetch recursively until it loads all specialists
      },
      {
        headers: {
          ...(this.data.appointment.market && { [X_HEADER_MARKETS]: this.data.appointment.market.code }),
        },
      },
    ).pipe(
      map(resp => resp.data),
    );
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  assign() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      this.req$ = this.appointments.update(
        this.data.appointment.id,
        {
          specialist: model.specialist.id,
        },
      ).subscribe(
        appointment => this.dialogRef.close(appointment),
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        },
      );
    }
  }

}
