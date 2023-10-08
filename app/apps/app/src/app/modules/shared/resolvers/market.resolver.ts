import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MarketEntity, MarketService } from '@app/ui';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root',
})
export class MarketResolver extends CrudResolver<MarketEntity> {
  protected constructor(service: MarketService, router: Router, location: Location) {
    super(service, router, location);
  }
}
