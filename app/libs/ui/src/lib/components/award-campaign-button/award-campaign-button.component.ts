import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonSize, ButtonType } from '../button/button.component';
import { Observable } from 'rxjs';
import { AwardCampaignEntity, AwardType } from '../../models/award-campaign.entity';
import { AwardCampaignService } from '../../services/award-campaign.service';

@Component({
  selector: 'app-award-campaign-button',
  templateUrl: './award-campaign-button.component.html',
})
export class AwardCampaignButtonComponent {

  public awardCampaign$: Observable<AwardCampaignEntity>;

  /**
   * The excludeRoutes property defines absolute paths.  This component will also exclude all child routes of the defined
   * routes.
   */
  @Input()
  public excludeRoutes: string[];

  @Input()
  public type: ButtonType = 'primary';

  @Input()
  public size: ButtonSize = 'large';

  @ContentChild(TemplateRef, { static: true })
  public templateRef: TemplateRef<any>;

  //
  @Input()
  public set awardType(awardType: AwardType) {
    /* If the supplied award type is different from the currently tracked campaign's award type, we will need to initiate a request
     * to resolve the default award campaign tied to this type. */
    this.awardCampaign$ = this.awardCampaignService.getAwardCampaignByName(awardType);
  }

  constructor(
    private readonly awardCampaignService: AwardCampaignService,
    private readonly router: Router,
  ) {}

  public isExcludedRoute() {
    return this.excludeRoutes && this.excludeRoutes.some(excludedRoute => this.router.url.includes(excludedRoute));
  }
}
