import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AppointmentEntity, AppointmentStatus, AuthService, Globals, PatientUser, PatientUserService, AwardType } from '@app/ui';
import { PaymentDto } from '../../../../../../../app/src/app/models/payment.dto';
import { Observable, Subject } from 'rxjs';
import { AppointmentService } from '../../../shared/services/appointment.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-patient-appointment-status',
  templateUrl: './appointment-status.component.html',
  styleUrls: ['./appointment-status.component.scss'],
})
export class AppointmentStatusComponent implements OnInit {
  @Input()
  appointment: AppointmentEntity;

  Status = AppointmentStatus;

  AwardType = AwardType;
  globals = Globals;

  payment$: Observable<PaymentDto>;
  notes_saved: boolean = false;
  patient_form: FormGroup;
  private notesLookup$: Subject<void> = new Subject();

  constructor(
    private readonly patientUserService: PatientUserService,
    private readonly auth: AuthService,
    private appointments: AppointmentService,
    fb: FormBuilder
  ) {
    this.patient_form = fb.group({
      notes: [null],
    });
  }

  ngOnInit() {
    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError("The property 'appointment' must be an instance of AppointmentEntity");
    }
    this.notes_saved = false;
    this.payment$ = this.appointments.readPayment(this.appointment.id);
    this.patient_form.patchValue({
      notes: this.appointment.patient.notes,
    });

    this.patient_form.valueChanges.subscribe(() => {
      this.notes_saved = false;
      this.notesLookup$.next();
    });
    this.notesLookup$
      .pipe(
        debounceTime(300),
        switchMap(() => {
          this.appointment.patient.notes = this.patient_form.value['notes'];
          return this.patientUserService.update(this.appointment.patient.id, this.appointment.patient);
        })
      )
      .subscribe(() => {
        this.notes_saved = true;
      });
  }
  getUser() {
    return this.auth.getAuthenticatedUser() as Observable<PatientUser>;
  }
}
