import { Injectable } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { Redirect, RedirectData, RedirectHandler } from '../services/redirect.service';

/**
 * Handles redirects to an external URL.
 */
@Redirect()
@Injectable()
export class ExternalRedirect implements RedirectHandler {
  constructor(private readonly navigationService: NavigationService) { }

  identify(redirectParams: RedirectData): boolean {
    return !redirectParams.subdomain && /^(http[s]?:\/\/)?([^\/]+)[.]([^\/]+)/.test(redirectParams.target);
  }

  redirect(redirectParams: RedirectData): void {
    this.navigationService.goToExternal(redirectParams.target);
  }
}
