import { Component} from '@angular/core';
import { CrudService, PatientUser, PatientUserService, MarketService } from '@app/ui';
import { AbstractMarketSensitiveListComponent } from '../../../shared/components/market-sensitive-list/abstract-market-sensitive-list.component';

@Component({
  selector: 'app-team-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
})
export class PatientListComponent extends AbstractMarketSensitiveListComponent<PatientUser> {
  constructor(
    private readonly service: PatientUserService,
    marketService: MarketService,
  ) {
    super(marketService);
  }

  getService(): CrudService<PatientUser> {
    return this.service;
  }
}
