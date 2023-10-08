import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { Response } from 'express';

/**
 * Helper service that provides an interface to easily read current URL properties, and handle external
 * routing operations.
 */
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(
    private readonly configService: ConfigurationService,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(RESPONSE) @Optional() private readonly response: Response,
  ) { }

  getSubdomain(): string {
    /* Form a regex string to seek the current subdomain. */
    const regex = new RegExp(`([^.]+)\\.${ this.configService.getDomain().replace('.', '\\.') }`);
    const match = regex.exec(this.document.location.hostname);

    /* If the subdomain is found, it'll be at index 1. */
    return (match && match.length > 1 && match[1]) || '';
  }

  goToExternal(target: string) {
    /* If on SSR - we're going to need to update the 'Response' object to perform an HTTP redirect instead of a
     * JS-based approach. */
    if (this.response) {
      this.response.status(302);
      this.response.setHeader('Location', target);

      return;
    }

    /* Otherwise, we can simply update the window.location property. */
    window.location.href = target;
  }
}
