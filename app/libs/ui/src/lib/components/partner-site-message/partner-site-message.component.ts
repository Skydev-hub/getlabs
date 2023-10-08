import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PartnerService } from '../../services/partner.service';
import { Subscription } from 'rxjs';
import { ReferrerService } from '../../services/referrer.service';
import { ReferrerType } from '../../models/analytics.dto';

@Component({
  selector: 'app-partner-site-message',
  templateUrl: './partner-site-message.component.html',
  styleUrls: ['./partner-site-message.component.scss'],
})
export class PartnerSiteMessageComponent implements OnInit, OnDestroy {
  private referrerSub: Subscription;

  @Input()
  fix: boolean = false;

  public banner: {
    partnerId: string,
    logo?: string,
    displayName: string,
  };

  constructor(
    private readonly referrerService: ReferrerService,
    private readonly partnerService: PartnerService,
  ) { }

  ngOnInit(): void {
    /* Hook into the referrer service's exposed observable, and update the internal referrer object according to the last-known
     * referrer. */
    this.referrerSub = this.referrerService.getReferrer$().subscribe(referrerResolve => {
      /* Evaluate the state of this referrer - if the referrer is a partner, and the partner's definition indicates that it
       * can be rendered in the banner, set the internal referrer object to this emission */
      const partnerDef = referrerResolve && referrerResolve.referral &&
        this.referrerService.isReferralActive(referrerResolve.referral, { type: ReferrerType.Partner }) ?
        this.partnerService.getPartnerDescriptor(referrerResolve.referral.data.referrer) : null;

      this.banner = partnerDef && partnerDef.getMetadata() && partnerDef.getMetadata().banner ? {
        partnerId: referrerResolve.referral.data.referrer,
        displayName: referrerResolve.referral.data.referrer,
        ...partnerDef.getMetadata().banner,
      } : null;
    });
  }

  ngOnDestroy(): void {
    this.referrerSub.unsubscribe();
  }
}
