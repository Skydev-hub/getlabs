import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Address, AnalyticsEventDto, AnalyticsService, AuthService, LabCompany, LabLocationService, PatientUser } from '@app/ui';
import { Timeslot } from '../../../../../models/timeslot.dto';
import { PriorityTimeslotDialogComponent } from '../../../../shared/components/dialog/priority-timeslot-dialog/priority-timeslot-dialog.component';
import { AppointmentService } from '../../../../shared/services/appointment.service';
import { BookPageComponent } from '../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../services/booking-flow.service';
import { AbstractAppointmentBookingPageComponent } from '../../appointment-booking/abstract-appointment-booking-page.component';
import {
  AddressWarningDialogComponent,
  AddressWarningDialogData,
  AddressWarningDialogType,
  AddressWarningLabDialogData
} from '../../../../shared/components/dialog/address-warning-dialog/address-warning-dialog.component';
import { AddressAutocompleteFormComponent, AddressAutocompleteFormLocationUpdated } from '../../address-autocomplete-form/address-autocomplete-form.component';

class BookingAddressWarningAnalyticsEvent extends AnalyticsEventDto {
  constructor(type: AddressWarningDialogType, continued: boolean) {
    super('Booking Address Warning', { type, continued });
  }
}

@Component({
  templateUrl: './book-schedule.component.html',
  styleUrls: ['./book-schedule.component.scss']
})
export class BookScheduleComponent extends AbstractAppointmentBookingPageComponent implements OnInit {
  @ViewChild(AddressAutocompleteFormComponent, { static: true })
  private addressForm: AddressAutocompleteFormComponent;

  private _slot: Timeslot;

  public address: Address;

  public isOutsideServiceArea = false;

  public PatientUser = PatientUser;

  user: PatientUser;

  LabCompany = LabCompany;

  constructor(
    breakpointObserver: BreakpointObserver,
    route: ActivatedRoute,
    appointmentService: AppointmentService,
    routerService: Router,
    @Optional() private bookPageComponent: BookPageComponent,
    private readonly auth: AuthService,
    private readonly bookingFlow: BookingFlowService,
    private readonly labLocationService: LabLocationService,
    private readonly analyticsService: AnalyticsService,
    private dialog: MatDialog
  ) {
    super(breakpointObserver, route, appointmentService, routerService);
  }

  async ngOnInit() {
    super.ngOnInit();
    this.user = this.route.snapshot.data.user;

    /* Add a listener onto the timeslotSelector to ensure that it updates the selected value whenever the value of the control changes. */
    this.formControl.valueChanges.subscribe((timeslot: Timeslot) => {
      const advance = () => {
        this.select(timeslot);
        /* Automatically advance to the next step... */
        this.goToNextStep();
      };

      if (timeslot.priority) {
        this.dialog
          .open(PriorityTimeslotDialogComponent)
          .afterClosed()
          .subscribe(confirmation => {
            if (confirmation) {
              advance();
            }
          });
      } else {
        advance();
      }
    });
  }

  locationUpdated(location: AddressAutocompleteFormLocationUpdated): void {
    const { address } = location;
    // if the address zip code changes reset the outside service area
    if (!this.address || !address || address.zipCode !== this.address.zipCode) {
      this.setOutsideServiceArea(false);
    }
    this.validateLocation(location);
    this.address = address;
  }

  validateLocation(location: AddressAutocompleteFormLocationUpdated): void {
    const { address, place } = location;
    // if the zip or street changes check if it matches on of the lab locations
    if (
      address &&
      address.zipCode &&
      address.street &&
      (!this.address || (address.zipCode !== this.address.zipCode || address.street !== this.address.street))
    ) {
      if (place && place.types && place.types.includes('route')) {
        // missing street number
        this.openAddressWarningModal({ type: AddressWarningDialogType.MissingStreetNumber });
      } else {
        // check if lab address
        this.labLocationService.listByAddress(address).subscribe(data => {
          if (data && data.total > 0) {
            this.openAddressWarningModal({
              type: AddressWarningDialogType.LabLocation,
              data: data.data[0]
            } as AddressWarningLabDialogData);
          }
        });
      }
    }
  }

  openAddressWarningModal(data: AddressWarningDialogData): void {
    this.dialog
      .open(AddressWarningDialogComponent, { data })
      .afterClosed()
      .subscribe(confirmation => {
        if (!confirmation) {
          this.addressForm.form.reset();
        }
        this.analyticsService.trackEvent(new BookingAddressWarningAnalyticsEvent(data.type, !!confirmation)).subscribe();
      });
  }

  select(slot: Timeslot): void {
    this._slot = slot;
  }

  hasSelectedSlot(): boolean {
    return !!this._slot;
  }

  getZipCode(): string {
    if (this.address) {
      return this.address.zipCode;
    }
    return null;
  }

  signIn($event) {
    this.bookingFlow.address = this.address;
    this.routerService.navigate(['/sign-in'], {
      queryParams: {
        phoneNumber: $event,
        redirectTo: '/book/out-of-area/complete'
      }
    });
  }

  setOutsideServiceArea(isOutside: boolean): void {
    this.isOutsideServiceArea = isOutside;
  }

  goToNextStep() {
    if (this.hasSelectedSlot()) {
      this.bookingFlow.timeslot = this._slot;
      this.bookingFlow.address = this.address;

      if (this.bookPageComponent) {
        this.bookPageComponent.nextStep();
      }
    }
  }
}
