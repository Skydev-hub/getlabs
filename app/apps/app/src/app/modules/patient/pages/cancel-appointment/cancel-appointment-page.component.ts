import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { applyNetworkValidationErrors, AppointmentCancelReason, AppointmentEntity, getFormFieldError, markFormAsTouched, PatientUser } from '@app/ui';
import { AppointmentService } from '../../../shared/services/appointment.service';

@Component({
  templateUrl: './cancel-appointment-page.component.html',
  styleUrls: ['./cancel-appointment-page.component.scss']
})
export class CancelAppointmentPageComponent implements OnInit {

  user: PatientUser;

  appointment: AppointmentEntity;

  form: FormGroup;

  req$: Subscription;

  hasFeedback = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: AppointmentService,
    private fb: FormBuilder,
  ) {
    this.form = fb.group({
      feedback: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.appointment = this.route.snapshot.data.appointment;

    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The property \'appointment\' must be an instance of AppointmentEntity');
    }

    if (!this.appointment.isCancellable()) {
      this.router.navigateByUrl('/');
    }
  }

  cancel() {
    this.req$ = this.service.cancel(this.appointment.id, AppointmentCancelReason.PatientSelfRequested).subscribe(appointment => this.appointment = appointment);
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service.feedback(this.appointment.id, model.feedback).subscribe(
        () => this.hasFeedback = true,
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        }
      );
    }
  }

}
