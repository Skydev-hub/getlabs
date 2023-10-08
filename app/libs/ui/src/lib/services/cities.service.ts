import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CrudService } from './crud.service';
import { CitiesByMarketDto } from '../models/cities.dto';

export interface CitiesByMarket {
  market: string;
  cities: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CitiesService extends CrudService<CitiesByMarketDto> {
  getResourceType() {
    return CitiesByMarketDto;
  }

  getResourceEndpoint(): string {
    return 'cities';
  }

  getCitiesByMarket(): Observable<CitiesByMarketDto> {
    return this.getHttpClient()
      .get<CitiesByMarketDto>(this.getEndpoint('/cities-by-market'))
      .pipe(map(resp => plainToClass(this.getResourceType(), resp)));
  }
}
