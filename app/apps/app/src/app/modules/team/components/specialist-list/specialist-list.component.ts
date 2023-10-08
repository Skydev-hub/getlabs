import { Component } from '@angular/core';
import { CrudService, SpecialistUser, SpecialistUserService, MarketService } from '@app/ui';
import { AbstractMarketSensitiveListComponent } from '../../../shared/components/market-sensitive-list/abstract-market-sensitive-list.component';

@Component({
  selector: 'app-team-specialist-list',
  templateUrl: './specialist-list.component.html',
  styleUrls: ['./specialist-list.component.scss'],
})
export class SpecialistListComponent extends AbstractMarketSensitiveListComponent<SpecialistUser> {
  constructor(
    private service: SpecialistUserService,
    marketService: MarketService,
  ) {
    super(marketService);
  }

  getService(): CrudService<SpecialistUser> {
    return this.service;
  }
}
