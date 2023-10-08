import { Component, Optional } from '@angular/core';
import { AppointmentEntity } from '@app/ui';
import { BookPageComponent } from '../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../services/booking-flow.service';

@Component({
  templateUrl: './book-complete.component.html',
  styleUrls: ['./book-complete.component.scss']
})
export class BookCompleteComponent {

  constructor(
    @Optional() private bookPageComponent: BookPageComponent,
    private bookingService: BookingFlowService,
  ) { }

  getAppointment(): AppointmentEntity {
    return this.bookingService.appointment;
  }
}
