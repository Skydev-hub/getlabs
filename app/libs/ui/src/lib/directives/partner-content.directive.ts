import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReferrerType } from '../models/analytics.dto';
import { LabCompany } from '../models/user';
import { ReferrerService } from '../services/referrer.service';

@Directive({
  selector: '[appPartnerContentDirective]',
  host: {
    '[class.h-hide]': '!isReferred'
  }
})
export class PartnerContentDirective implements OnInit, OnDestroy {
  @Input('appPartnerContentDirective')
  private labCompany: LabCompany;

  public isReferred: boolean;

  private subscription$: Subscription;

  constructor(private readonly referrerService: ReferrerService) {}

  ngOnInit(): void {
    this.subscription$ = this.referrerService.getReferrer$().subscribe(referralData => {
      const referrer = referralData && referralData.referral;

      /* If labCompany is not defined, then this directive treats *any* active affiliation with a partner company as the negative case. */
      this.isReferred = this.labCompany ?
        !!referrer && this.referrerService.isReferralActive(referrer, { company: this.labCompany }) :
        !referrer || !this.referrerService.isReferralActive(referrer, { type: ReferrerType.Partner });
    });
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
