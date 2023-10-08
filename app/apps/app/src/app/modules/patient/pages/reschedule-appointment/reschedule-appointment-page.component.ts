import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe } from '@app/ui';
import { Subscription } from 'rxjs';
import { Timeslot } from '../../../../models/timeslot.dto';
import { AbstractAppointmentBookingPageComponent } from '../../components/appointment-booking/abstract-appointment-booking-page.component';

@Component({
  templateUrl: './reschedule-appointment-page.component.html',
  styleUrls: ['./reschedule-appointment-page.component.scss']
})
export class RescheduleAppointmentPageComponent extends AbstractAppointmentBookingPageComponent implements OnInit {

  req$: Subscription;

  isOutsideServiceArea = false;

  reschedule(timeslot: Timeslot): Subscription {
    if (this.formControl.valid) {
      return this.appointmentService.rebook(this.appointment.id, timeslot.key).subscribe(AutoUnsubscribe(() => {
        /* Route back to the appointment confirmation view. */
        this.routerService.navigateByUrl('/');
      }));
    }
  }

  ngOnInit(): void {
    super.ngOnInit();

    /* If no appointment is available, navigate away from this view back to the root view... */
    if (!this.appointment || !this.appointment.isRebookable) {
      this.routerService.navigateByUrl('/');
    }
  }

  setOutsideServiceArea(isOutside: boolean): void {
    this.isOutsideServiceArea = isOutside;
  }
}
