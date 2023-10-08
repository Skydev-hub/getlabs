import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { BookStep } from '../../../models/book-step.dto';
import { AuthService } from '@app/ui';
import { BookingFlowService } from '../services/booking-flow.service';

@Injectable({
  providedIn: 'root',
})
export class BookStepGuard implements CanActivate {
  //
  // TODO: This guard should be removed and the booking flow should be refactored to use a proper stepper component
  //

  constructor(private bookingFlowService: BookingFlowService, private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.hasRequirementsForStep(route.data.step)) {
      return true;
    }

    return this.router.parseUrl('/book');
  }

  // TODO - candidate for refactoring - may consider moving this to a format that responds with a string containing the address if the
  // re-reouting case is different, and simply false if it needs to return to the start of the booking flow
  private hasRequirementsForStep(step: BookStep): boolean {
    // Reverse fall-through switch statement to verify requirements for current and all previous steps
    // I.e. Step 4 cannot activate without meeting the requirements for step 3, 2, and 1 as well

    // noinspection FallThroughInSwitchStatementJS
    switch (step) {
      case BookStep.Confirmation:
        if (!this.bookingFlowService.paymentIntentId) {
          return false;
        }

      case BookStep.Payment:
        if (!this.bookingFlowService.labOrderDetails || !this.bookingFlowService.labOrderDetails.length) {
          return false;
        }

      case BookStep.LabOrderEntry:
        if (!this.authService.getUser() || !this.authService.getUser().isProfileCompleted()) {
          return false;
        }

      case BookStep.Profile:
        if (!this.bookingFlowService.timeslot) {
          return false;
        }

      case BookStep.TimeslotSelection:
      // if (!this.bookingFlowService.labOrderDetails) {
      //   return false;
      // }

      default:
        return true;
    }
  }
}
