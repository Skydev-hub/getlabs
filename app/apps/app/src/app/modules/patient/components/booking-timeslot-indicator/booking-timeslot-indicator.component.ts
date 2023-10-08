import { Component, Input } from '@angular/core';
import { Timeslot } from 'apps/app/src/app/models/timeslot.dto';

@Component({
  selector: 'app-patient-booking-timeslot-indicator',
  templateUrl: './booking-timeslot-indicator.component.html',
  styleUrls: ['./booking-timeslot-indicator.component.scss'],
})
export class BookingTimeslotIndicatorComponent {

  @Input()
  timeslot: Timeslot;

  @Input()
  tz: string;

}
