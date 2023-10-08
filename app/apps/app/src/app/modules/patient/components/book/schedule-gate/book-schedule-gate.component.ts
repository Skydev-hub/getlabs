import { Component, Optional } from '@angular/core';
import { BookPageComponent } from '../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../services/booking-flow.service';

/**
 * Gating component for users to select whether or not they have their lab order in hand.
 * This component should logically exist at the start of the booking flow.
 */
@Component({
  templateUrl: './book-schedule-gate.component.html',
  styleUrls: ['./book-schedule-gate.component.scss'],
})
export class BookScheduleGateComponent {
  constructor(@Optional() private bookPageComponent: BookPageComponent,
              private bookingFlow: BookingFlowService) {}

  /**
   * Sets the general lab order provisioning method based off of feedback from the user.  If true,
   * this user has their lab order in hand; if false, this user needs us to retrieve their lab
   * order from their doctor.
   */
  public setLabOrder(v: boolean) {
    this.bookingFlow.hasLabOrder = v;

    /* Move to the next step, keeping track of the lab order provisioning method supplied by the user. */
    this.bookPageComponent.nextStep({ uploadLabOrder: v });
  }
}
