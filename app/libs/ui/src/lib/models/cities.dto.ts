import { Type } from 'class-transformer';
export class CitiesByMarket {
  market: string;
  cities: string[];
}

export class CitiesByMarketDto {
  @Type(() => CitiesByMarket)
  public data: CitiesByMarket[];
}
