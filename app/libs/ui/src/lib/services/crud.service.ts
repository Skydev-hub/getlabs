import { HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpParams, HttpProgressEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Type } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { ConfigurationService } from './configuration.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DeepPartial } from 'ts-essentials';
import { MarketEntity, PagedResponseDto } from '../models';
import { AnalyticsService } from './analytics.service';

/**
 * Base event that is generated from the stream returned by 'createWithProgress'.
 */
export interface CreateStreamEvent<E> {
  event: HttpEvent<E>;
}

export type CrudFilters<T> = {
  [key in keyof T]?: any | any[] | boolean | CrudFilters<any>;
};

export interface RequestOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
}

/**
 * An event that is fired whenever the createWithProgress stream generates an upload progress event.
 */
export interface CreateStreamProgressEvent<E> extends CreateStreamEvent<E> {
  progress: number;
}

/**
 * An event that is fired whenever the createWithProgress stream generates an upload complete event.
 */
export interface CreateStreamResultEvent<E> extends CreateStreamEvent<E> {
  payload: E;
}

@Injectable({
  providedIn: 'root'
})
export abstract class CrudService<E extends object> {

  constructor(
    private readonly http: HttpClient,
    private readonly analytics: AnalyticsService,
    private readonly config: ConfigurationService,
  ) {}

  abstract getResourceType(): Type<E>;

  abstract getResourceEndpoint(): string;

  getHttpClient(): HttpClient {
    return this.http;
  }

  getEndpoint(path?: string): string {
    return this.config.getApiEndPoint([this.getResourceEndpoint(), path]);
  }

  create<T extends object>(data: DeepPartial<E | T>, options?: RequestOptions): Observable<E> {
    return this.http.post<E>(this.getEndpoint(), { ...data }, this.getOptions(options)).pipe(
      map(resp => plainToClass(this.getResourceType(), resp)),
    );
  }

  /**
   * Executes a POST operation to create the requested resource, and returns an observable that may
   * be used to observe operation progress and completion.
   */
  createWithProgress(data: DeepPartial<E>): Observable<CreateStreamProgressEvent<E> | CreateStreamResultEvent<E>> {
    const httpReq = new HttpRequest(
      'POST',
      this.getEndpoint(),
      { ...data },
      {
        reportProgress: true
      }
    );

    return this.http.request<E>(httpReq).pipe(
      filter(evt => {
        return evt.type === HttpEventType.UploadProgress || evt.type === HttpEventType.Response;
      }),
      map((event: HttpEvent<E>) => {
        return event instanceof HttpResponse
          ? {
              event,
              payload: plainToClass(this.getResourceType(), event.body)
            }
          : {
              event,
              progress: Math.round(((event as HttpProgressEvent).loaded / (event as HttpProgressEvent).total) * 100)
            };
      })
    );
  }

  list(params?: { [param: string]: string | string[] } | HttpParams, options?: RequestOptions & { filters?: CrudFilters<E> }): Observable<PagedResponseDto<E>> {
    /* Using some syntactic sugar to simplify the process of removing the filter parameter when it's undefined. */
    const filtersContainer = options && options.filters && Object.keys(options.filters).length > 0 ? { filters: JSON.stringify(options.filters) } : null;

    return this.http
      .get<PagedResponseDto<E>>(this.getEndpoint(), {
        params: {
          ...filtersContainer,
          ...(params instanceof HttpParams ? this.exportHttpParams(params) : params)
        },
        ...options
      })
      .pipe(map(resp => ({ ...resp, data: plainToClass(this.getResourceType(), resp.data) })));
  }

  read(id: string | number, options?: RequestOptions): Observable<E> {
    return this.http.get<E>(`${this.getEndpoint()}/${id}`, options).pipe(map(resp => plainToClass(this.getResourceType(), resp)));
  }

  update(id: string | number, data: DeepPartial<E>, options?: RequestOptions): Observable<E> {
    return this.http
      .patch<E>(`${this.getEndpoint()}/${id}`, { ...data }, this.getOptions(options))
      .pipe(map(resp => plainToClass(this.getResourceType(), resp)));
  }

  delete(id: string | number, options?: RequestOptions): Observable<null> {
    return this.http.delete<null>(`${this.getEndpoint()}/${id}`, this.getOptions(options));
  }

  save(data: DeepPartial<E>, options?: RequestOptions): Observable<E> {
    return data['id'] ? this.update(data['id'], data, options) : this.create(data, options);
  }

  private getOptions(options?: RequestOptions): RequestOptions {
    const headers = options && options.headers;

    /* Preserve all originally-supplied options and headers; however, we also need to attach the analytics token to the headers
     * set, thus the odd-looking construction below. */
    return {
      ...options,
      headers: {
        'X-Analytics-Token': this.analytics.getAnalyticsUserToken(),
        ...headers
      }
    };
  }

  /**
   * Transforms an HttpParams object to a plain object.  All values will be rendered as arrays, as .get() simply returns the
   * first value set on a given key.
   */
  private exportHttpParams(params: HttpParams) {
    return params.keys().reduce((collector, key) => {
      collector[key] = params.getAll(key);
      return collector;
    }, {});
  }
}

export interface CrudServiceWithMarkets<E extends object> extends CrudService<E> {
  updateMarkets(id: string, marketIds: string[]): Observable<MarketEntity[]>;
}
