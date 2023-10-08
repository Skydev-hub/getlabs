import { AbstractAssignMarketsComponent } from '../../assign-markets/assign-markets.component';
import { MarketService, StaffUser, StaffUserService } from '@app/ui';
import { FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-team-member-markets',
  templateUrl: '../../assign-markets/assign-markets.component.html',
  styleUrls: ['../../assign-markets/assign-markets.component.scss']
})
export class TeamMemberMarketsComponent extends AbstractAssignMarketsComponent<StaffUser> {
  constructor(protected service: StaffUserService, protected marketService: MarketService, protected fb: FormBuilder) {
    super(service, marketService, fb);
  }
}
