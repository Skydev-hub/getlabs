import { Component } from '@angular/core';
import { StaffUser, StaffUserService, MarketService } from '@app/ui';
import { AbstractMarketSensitiveListComponent } from '../../../shared/components/market-sensitive-list/abstract-market-sensitive-list.component';

@Component({
  selector: 'app-team-team-member-list',
  templateUrl: './team-member-list.component.html',
  styleUrls: ['./team-member-list.component.scss'],
})
export class TeamMemberListComponent extends AbstractMarketSensitiveListComponent<StaffUser> {
  constructor(
    private service: StaffUserService,
    marketService: MarketService,
  ) {
    super(marketService);
  }

  getService() {
    return this.service;
  }
}
