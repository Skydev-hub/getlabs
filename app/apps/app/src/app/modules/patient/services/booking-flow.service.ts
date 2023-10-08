import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Address,
  AppointmentEntity,
  LabCompany,
  LabOrderDetailsEntity,
  PartnerService,
  ReferralEmbed,
  ReferrerService,
  ReferrerType
} from '@app/ui';
import { Observable, of } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import { Timeslot } from '../../../models/timeslot.dto';
import { AppointmentService } from '../../shared/services/appointment.service';

@Injectable({
  providedIn: 'root'
})
export class BookingFlowService {

  timeslot: Timeslot;

  timezone: string;

  address: Address;

  paymentIntentId: string;

  coupon: string;

  appointment: AppointmentEntity;

  labOrderDetails: LabOrderDetailsEntity[];

  /* As the booking flow continues to evolve, this should be re-thought... We are technically duplicating data here and in
   * labOrderDetails - however, our current design only has a singular "has lab order" selector, thus we are forced to use
   * this property as a means of overriding/setting labOrderDetails.hasLabOrder in each individual object. */
  hasLabOrder: boolean;

  isMedicare: boolean;

  private acknowledgements: { [key in LabCompany]?: boolean } = {};

  constructor(
    private http: HttpClient,
    private appointmentService: AppointmentService,
    private readonly partnerService: PartnerService,
    private readonly referrerService: ReferrerService,
  ) {
    this.reset();
  }

  create(): Observable<AppointmentEntity> {

    // TODO: Create a validation method from these requirements that can be used by route guard too
    if (!this.timeslot || !this.labOrderDetails || !this.labOrderDetails.length || !this.paymentIntentId) {
      return;
    }

    return this.appointmentService.createFromKey(
      this.timeslot.key,
      this.labOrderDetails,
      this.paymentIntentId,
      this.coupon,
      this.isMedicare,
    ).pipe(
      tap(appointment => this.appointment = appointment),
    );
  }

  // Reset the booking flow state
  reset() {
    this.timeslot = undefined;
    this.paymentIntentId = undefined;

    this.labOrderDetails = [];

    /* Default state for lab order deets is that the patient does not have the lab order in hand. */
    this.hasLabOrder = false;

    this.acknowledgements = {};
  }

  doAcknowledgements(labCompanyOrReferral: LabCompany | ReferralEmbed): Observable<boolean> {
    /* Type narrowing for the targeted lab company. */
    const referral: ReferralEmbed = labCompanyOrReferral instanceof ReferralEmbed && labCompanyOrReferral;
    const partner: LabCompany = referral ?
      referral.referralMethod === ReferrerType.Partner && referral.data.referrer :
      labCompanyOrReferral as LabCompany;

    /* If the inbound value does not indicate a target partner, return an observable with a value of null. */
    if (!partner) {
      return of(null);
    }

    /* Check to see if we already have an affirmative acknowledgement for the supplied lab company.  If we don't, call the partner service to make
     * this determination. */
    if (this.acknowledgements[partner]) {
      return of(this.acknowledgements[partner]);
    }

    /* Otherwise, we will need to interrogate the service that corresponds to the type of the inbound value. */
    const obs = (referral ? this.referrerService.acknowledge(referral) :
      this.partnerService.acknowledge(partner)).pipe(
      tap(result => this.acknowledgements[partner] = result),
      share()
    );

    return obs;
  }
}
