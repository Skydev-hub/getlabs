import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Address, LabCompany, LabLocationDetails, LabLocationEntity, MarketEntity, PagedResponseDto } from '../models';
import { CrudService, CrudServiceWithMarkets } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class LabLocationService extends CrudService<LabLocationEntity> implements CrudServiceWithMarkets<LabLocationEntity> {
  getResourceType() {
    return LabLocationEntity;
  }

  getResourceEndpoint(): string {
    return 'lab-location';
  }

  readBySlug(lab: LabCompany, slug: string): Observable<LabLocationDetails> {
    return this.getHttpClient()
      .get<LabLocationDetails>(this.getEndpoint(`${lab}/${slug}`))
      .pipe(map(resp => plainToClass(LabLocationDetails, resp)));
  }

  listByAddress(address: Address): Observable<PagedResponseDto<LabLocationEntity>> {
    return this.getHttpClient()
      .get<PagedResponseDto<LabLocationEntity>>(this.getEndpoint(`/address/${address.zipCode}/${address.street}`))
      .pipe(map(resp => ({ ...resp, data: plainToClass(this.getResourceType(), resp.data) })));
  }

  updateMarkets(id: string, marketIds: string[]): Observable<MarketEntity[]> {
    return this.getHttpClient()
      .post<MarketEntity[]>(this.getEndpoint(`${id}/markets`), { marketIds })
      .pipe(map(res => res.map(el => plainToClass(MarketEntity, el))));
  }
}
