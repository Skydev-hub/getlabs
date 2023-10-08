import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeepPartial } from 'ts-essentials';
import { PagedResponseDto } from '@app/ui';

export interface ICrudService<E> {
  getHttpClient(): HttpClient;

  getEndpoint(): string;

  create(data: DeepPartial<E>): Observable<E>;

  list(params?: { [param: string]: string | string[] } | HttpParams): Observable<PagedResponseDto<E>>;

  read(id: string | number): Observable<E>;

  update(id: string | number, data: DeepPartial<E>): Observable<E>;

  delete(id: string | number): Observable<null>;

  save(data: DeepPartial<E>): Observable<E>;
}
