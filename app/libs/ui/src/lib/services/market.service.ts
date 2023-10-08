import { Injectable } from '@angular/core';
import { MarketEntity } from '../models/market.entity';
import { CrudService } from './crud.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MarketService extends CrudService<MarketEntity> {
  private activeMarketsSubject$: BehaviorSubject<MarketEntity[]> = new BehaviorSubject<MarketEntity[]>([]);
  private activeMarkets$: Observable<MarketEntity[]> = this.activeMarketsSubject$.asObservable();


  getActiveMarkets$() {
    return this.activeMarkets$;
  }

  setActiveMarkets(markets: MarketEntity[]) {
    this.activeMarketsSubject$.next(markets || []);
  }

  getResourceType() {
    return MarketEntity;
  }

  getResourceEndpoint(): string {
    return 'market';
  }
}
