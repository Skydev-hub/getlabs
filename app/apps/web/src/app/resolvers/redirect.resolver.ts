import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigurationService, InterAppUrlPipe } from '@app/ui';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import * as Sentry from '@sentry/browser';
import { Response } from 'express';
import { Observable, of } from 'rxjs';

export enum RedirectDestinations {
  BookingFlow = 'BOOK'
}

const RedirectDestinationMappings: { [key in RedirectDestinations]: (config: ConfigurationService) => string } = {
  [RedirectDestinations.BookingFlow]: (config) => new InterAppUrlPipe(config).transform('/book', 'app'),
};

const RedirectQueryParamKey = 'redirect';

@Injectable({
  providedIn: 'root',
})
export class RedirectResolver implements Resolve<null> {
  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(RESPONSE) @Optional() private readonly response: Response,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly config: ConfigurationService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<null> {
    /* If the 'redirect' parameter is present, attempt to extract the parameter and map it to UNE DESTINATION... */
    const redirect = route.queryParams[RedirectQueryParamKey] ? RedirectDestinationMappings[route.queryParams[RedirectQueryParamKey].toUpperCase()] : null;

    /* If no redirect was resolved, allow the app to continue to its destination state */
    if (!redirect) {
      return of(null);
    }

    /* If the inbound query parameters include a 'ref' parameter, we want to track these cases so we can figure out how/why LabCorp
     * is referring pts to us without including it, or if it's a bug in the routing component. */
    if (route.queryParams.ref) {
      Sentry.captureException(`Warning: Inbound partner referral detected without a 'ref' parameter.  Referrer URI: ` +
        `${ isPlatformBrowser(this.platformId) ? this.document.referrer : 'not available (SSR)' }; ` +
        `Current URL: ${ this.document.location.href } ` +
        `Supplied query params: ${ Object.keys(route.queryParams).map(queryParamKey => `${ queryParamKey }: ${ route.queryParams[queryParamKey] }`) }`);
    }

    const redirectObj = new URL(redirect(this.config));

    /* Preserve the existing query params */
    Object.keys(route.queryParams).forEach(qpKey => {
      if (qpKey !== RedirectQueryParamKey) {
        redirectObj.searchParams.set(qpKey, route.queryParams[qpKey]);
      }
    });

    /* If a redirect was resolved, redirect the user accordingly. */
    /* The redirect method will depend on whether or not the app is presently being served via SSR... */
    if (this.response) {
      this.response.status(302);
      this.response.setHeader('Location', redirectObj.href);
    }

    /* Non SSR */
    else if (isPlatformBrowser(this.platformId)) {
      window.location.href = redirectObj.href;
    }
  }
}

