import { Injectable } from '@angular/core';
import { ConfigurationService } from '../services/configuration.service';
import { NavigationService } from '../services/navigation.service';
import { Redirect, RedirectData, RedirectHandler, RedirectService } from '../services/redirect.service';

/**
 * Handles redirects to an inter-app destination (i.e. a destination on another subdomain than the
 * current subdomain).
 */
@Redirect()
@Injectable()
export class InterAppRedirect implements RedirectHandler {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly redirectService: RedirectService,
    private readonly navigationService: NavigationService,
  ) { }

  identify(redirectParams: RedirectData): boolean {
    return !!redirectParams.subdomain &&
      this.navigationService.getSubdomain().toUpperCase() !== redirectParams.subdomain.toUpperCase() &&
        !redirectParams.target.indexOf('/');
  }

  redirect(redirectParams: RedirectData): void {
    const target = this.configurationService.determineURL(redirectParams.target, redirectParams.subdomain);
    this.navigationService.goToExternal(target);
  }
}
