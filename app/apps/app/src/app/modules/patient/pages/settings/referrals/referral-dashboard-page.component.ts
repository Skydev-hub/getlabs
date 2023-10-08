import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService, PatientUser, AwardCampaignEntity, AwardType, AwardCampaignService } from '@app/ui';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-referral-dashboard-page',
  templateUrl: './referral-dashboard-page.component.html',
  styleUrls: ['./referral-dashboard-page.component.scss']
})
export class ReferralDashboardPageComponent implements OnInit {
  public user: PatientUser;

  public awardCampaign$: Observable<AwardCampaignEntity>;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly configService: ConfigurationService,
    private readonly awardCampaignService: AwardCampaignService,
  ) {}

  ngOnInit(): void {
    this.user = this.activatedRoute.snapshot.data.user;

    this.awardCampaign$ = this.awardCampaignService.getAwardCampaignByName(AwardType.OneTimeReferrerCreditAward);
  }
}
