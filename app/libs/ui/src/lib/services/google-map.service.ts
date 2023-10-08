import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@app/shared/environments';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

/**
 * Utility service that handles interactions with Google Maps API endpoints
 */
@Injectable({
  providedIn: 'root',
})
export class GoogleMapService {
  /* Will be used to contain the API request dispatched to Google Maps for authenticating this client. */
  private _auth$: Observable<boolean>;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Initializes the google maps API by loading the google maps JS file with the configured API key.
   */
  public init() {
    /* If _auth$ has not yet been initialized, initialize it now by calling the corresponding maps auth service. */
    if (!this._auth$) {
      this._auth$ = this.httpClient.jsonp(
        `https://maps.googleapis.com/maps/api/js?key=${ environment.googleMapsKey }`, 'callback'
      ).pipe(
        map(() => true),
        catchError(() => {
          return of(false)
        }),
        shareReplay(1),
      );
    }

    return this._auth$;
  }
}
