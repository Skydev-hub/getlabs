import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentBookingTypes, AppointmentEntity, SpecialistUser, User } from '@app/ui';
import { DoubleBookingConfirmationDialogComponent } from 'apps/app/src/app/modules/shared/components/dialog/double-booking-confirmation-dialog/double-booking-confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { Timeslot } from '../../../../../models/timeslot.dto';
import { AppointmentService } from '../../../../shared/services/appointment.service';

@Component({
  templateUrl: './appointment-rebook-page.component.html',
  styleUrls: ['./appointment-rebook-page.component.scss'],
})
export class AppointmentRebookPageComponent implements OnInit {
  appointment: AppointmentEntity;

  rebooked: AppointmentEntity;

  req$: Subscription;

  AppointmentBookingTypes = AppointmentBookingTypes;

  userType = SpecialistUser;

  specialist: SpecialistUser;

  formControl = new FormControl();

  isOutsideServiceArea = false;

  constructor(private route: ActivatedRoute, private router: Router, private service: AppointmentService, private dialog: MatDialog) {}

  ngOnInit() {
    this.appointment = this.route.snapshot.data.appointment;

    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError("The property 'appointment' must be an instance of AppointmentEntity");
    }
  }

  setSpecialist(user: User | SpecialistUser) {
    this.specialist = user instanceof SpecialistUser ? user : undefined;
  }

  hasSelectedSlot(): boolean {
    return !!this.formControl.value;
  }

  getSelectedSlot(): Timeslot {
    return this.formControl.value;
  }

  transfer() {
    const timeslot = this.getSelectedSlot();

    if (timeslot.booked) {
      this.dialog
        .open(DoubleBookingConfirmationDialogComponent)
        .afterClosed()
        .subscribe((val) => {
          if (val) {
            this.rebook();
          }
        });
    } else {
      this.rebook();
    }
  }

  rebook() {
    const timeslot = this.getSelectedSlot();

    if (timeslot) {
      this.req$ = this.service.rebook(this.appointment.id, timeslot.key).subscribe((appointment) => (this.rebooked = appointment));
    }
  }

  setOutsideServiceArea(isOutside: boolean): void {
    this.isOutsideServiceArea = isOutside;
  }
}
