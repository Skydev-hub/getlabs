import { Point } from 'geojson';
import { Type } from 'class-transformer';
import { MarketEntity } from './market.entity';

export class ServiceAreaEntity {
  id: string;
  city: string;
  county: string;
  state: string;
  zipCode: string;
  geo: Point;
  timezone: string;
  active: boolean;

  @Type(() => MarketEntity)
  market?: MarketEntity;

  get location(): string {
    return [this.city, this.county, this.state].filter(Boolean).join(', ');
  }
}
