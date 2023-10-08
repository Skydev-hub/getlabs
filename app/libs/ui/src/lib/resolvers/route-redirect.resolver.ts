import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { RedirectData, RedirectService } from '../services/redirect.service';

/**
 * Resolver that redirects users to the route described by the route's 'redirect' data parameter.  Consumers may
 * use this resolver as part of a standard 'resolver' routing object parameter structure.
 *
 * Consumers must specify the aforementioned 'redirect' property in the route's data parameter; this property
 * is of type RedirectData.
 */
@Injectable({
  providedIn: 'root'
})
export class RouteRedirectResolver implements Resolve<null> {

  constructor(private readonly redirectService: RedirectService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /* Collect the redirect parameters from the linked route. */
    const redirectParams: RedirectData = route.data.redirect;

    /* If the redirect parameters are not present, or the target is not defined, throw an exception. */
    if (!redirectParams || !redirectParams.target) {
      throw new Error(`Cannot perform redirect - the consuming route must add a parameter to the data prop named 'redirect', which ` +
        `must have the shape as ExternalRedirectData`);
    }

    /* Invoke the redirect action. */
    this.redirectService.redirect(redirectParams);

    return of(null);
  }
}
