import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document, DocumentSigningUrl, DocumentType, MarketEntity } from '../models';
import { CrudService, CrudServiceWithMarkets } from './crud.service';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class UserCrudService<E extends object> extends CrudService<E> implements CrudServiceWithMarkets<E> {
  updateDocument(id: string, dto: Document): Observable<Document> {
    return this.getHttpClient()
      .post<Document>(this.getEndpoint(`${id}/document`), dto)
      .pipe(map(res => plainToClass(Document, res)));
  }

  readDocumentSigningUrl(id: string, type: DocumentType): Observable<DocumentSigningUrl> {
    return this.getHttpClient()
      .get<DocumentSigningUrl>(this.getEndpoint(`${id}/document/${type}/signing-url`))
      .pipe(map(res => plainToClass(DocumentSigningUrl, res)));
  }

  updateMarkets(id: string, marketIds: string[]): Observable<MarketEntity[]> {
    return this.getHttpClient()
      .post<MarketEntity[]>(this.getEndpoint(`${id}/markets`), { marketIds })
      .pipe(map(res => res.map(el => plainToClass(MarketEntity, el))));
  }
}
