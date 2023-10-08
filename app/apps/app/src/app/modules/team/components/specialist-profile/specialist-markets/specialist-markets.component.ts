import { AbstractAssignMarketsComponent } from '../../assign-markets/assign-markets.component';
import { MarketService, SpecialistUser, SpecialistUserService, StaffUser, StaffUserService } from '@app/ui';
import { FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-specialist-markets',
  templateUrl: '../../assign-markets/assign-markets.component.html',
  styleUrls: ['../../assign-markets/assign-markets.component.scss']
})
export class SpecialistMarketsComponent extends AbstractAssignMarketsComponent<SpecialistUser> {
  constructor(protected service: SpecialistUserService, protected marketService: MarketService, protected fb: FormBuilder) {
    super(service, marketService, fb);
  }
}
