import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigurationService, InterAppUrlPipe, ReferrerService, ReferrerType } from '@app/ui';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReferrerRedirectResolver implements Resolve<null> {
  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(RESPONSE) @Optional() private readonly response: Response,
    private readonly referrerService: ReferrerService,
    private readonly config: ConfigurationService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /* Identify the referrer type associated with the inbound URL... */
    const referrer = this.referrerService.generateReferral();

    if (!referrer || referrer.referralMethod !== ReferrerType.Partner) {
      return of(null);
    }

    const redirect = new InterAppUrlPipe(this.config).transform(`/book?ref=labcorp&ack=${ !!referrer.data.acknowledged }`, 'app');

    /* The redirect method will depend on whether or not the app is presently being served via SSR... */
    if (this.response) {
      this.response.status(302);
      this.response.setHeader('Location', redirect);
    }

    /* Non SSR */
    else if (isPlatformBrowser(this.platformId)) {
      window.location.href = redirect;
    }
  }
}
