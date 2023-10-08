import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { AwardCampaignEntity, AwardType } from '../../models/award-campaign.entity';
import { AwardCampaignService } from '../../services/award-campaign.service';

@Component({
  selector: 'app-award-campaign-amount',
  templateUrl: './award-campaign-amount.component.html',
})
export class AwardCampaignAmountComponent {
  awardCampaign$: Observable<AwardCampaignEntity>;

  private _awardType: AwardType;

  @ContentChild(TemplateRef, { static: true })
  public templateRef: TemplateRef<any>;

  @Input()
  set awardType(awardType: AwardType) {
    this.awardCampaign$ = this.awardCampaignService.getAwardCampaignByName(awardType);
    this._awardType = awardType;
  }

  get awardType() {
    return this._awardType;
  }

  constructor(private readonly awardCampaignService: AwardCampaignService) { }
}
