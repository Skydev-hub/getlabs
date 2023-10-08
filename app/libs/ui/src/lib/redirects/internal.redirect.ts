import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { Redirect, RedirectData, RedirectHandler } from '../services/redirect.service';

/**
 * Handles redirects to destinations within the same Angular application context.
 */
@Redirect()
@Injectable()
export class InternalRedirect implements RedirectHandler {
  constructor(
    private readonly router: Router,
    private readonly navigationService: NavigationService,
  ) { }

  identify(redirectParams: RedirectData): boolean {
    return (!redirectParams.subdomain ||
      redirectParams.subdomain.toUpperCase() === this.navigationService.getSubdomain().toUpperCase()) &&
        !redirectParams.target.indexOf('/');
  }

  redirect(redirectParams: RedirectData): void {
    this.router.navigateByUrl(redirectParams.target);
  }
}
