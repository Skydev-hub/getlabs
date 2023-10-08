import { Component, OnInit } from '@angular/core';
import { AwardCampaignEntity, AwardCampaignService, AwardType, ConfigurationService, PatientUser } from '@app/ui';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-share-referral',
  templateUrl: './share-referral.component.html',
  styleUrls: ['./share-referral.component.scss']
})
export class ShareReferralComponent implements OnInit {
  public user: PatientUser;

  public awardCampaign$: Observable<AwardCampaignEntity>;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly configService: ConfigurationService,
    private readonly toastrService: ToastrService,
    private readonly awardCampaignService: AwardCampaignService
  ) {}

  ngOnInit(): void {
    this.user = this.activatedRoute.snapshot.data.user;

    this.awardCampaign$ = this.awardCampaignService.getAwardCampaignByName(AwardType.OneTimeReferrerCreditAward);
  }

  onCopy() {
    this.toastrService.success(`Referral link copied to clipboard.  You can now paste your referral link anywhere.`);
  }
}
