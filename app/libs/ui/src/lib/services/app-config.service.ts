import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { ConfigDto } from '../models/config.dto';
import { ConfigurationService } from './configuration.service';

/**
 * The key difference between this service and ConfigurationService is the domain and source of
 * configuration values managed by the respective service.  This service manages configuration
 * values defined on the backend, which govern app functionality; ConfigurationService manages
 * configuration values defined ont he front end, which define environment properties.
 */
@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private _config$: Observable<ConfigDto>;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigurationService,
  ) {

  }

  get$(key: string) {
    /* If the config data has not yet been retrieved, we will need to invoke a call to retrieve it now. */
    if (!this._config$) {
      this._config$ = this.httpClient.get(this.configService.getApiEndPoint('config')).pipe(
        /* Type marshalling */
        map(result => plainToClass(ConfigDto, result)),

        /* If we encounter an exception, we will log the exception details, and pass back a blank object, which
         * will effectively mean that the result of the returned observable will be null.  We do not cache
         * default config values on the front end; therefore, we will unset _config$ so that the next consumer
         * re-attempts retrieval of the config object. */
        catchError(err => {
          console.error(`Cannot retrieve configuration data due to an encountered exception: ${ err }`);
          this._config$ = null;

          return of(new ConfigDto());
        }),

        /* Share observable so that we don't invoke this endpoint more than once. */
        shareReplay(),
      )
    }

    /* Return an observable tailing off of the config retrieval observable that delivers the requested value. */
    return this._config$.pipe(
      map(config => config[key])
    );
  }
}
