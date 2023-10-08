import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '@app/ui';

/**
 * Ensures the user has completed the onboarding process
 */
@Injectable({
  providedIn: 'root'
})
export class OnboardingCompletedGuard implements CanActivate, CanActivateChild {

  protected constructor(private auth: AuthService, private router: Router, private location: Location) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canAccess(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canAccess(route, state);
  }

  private canAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.auth.getAuthenticatedUser().pipe(
      map(user => user && user.isOnboarded()),
      map(isOnboarded => {
        if (!isOnboarded) {
          // Hack to display proper URL until Angular supports redirecting to a different component without
          // updating the location. See: https://github.com/angular/angular/issues/16981
          this.router.events
              .pipe(
                filter(event => event instanceof NavigationEnd),
                take(1)
              )
              .subscribe(() => this.location.replaceState(state.url));

          return this.router.parseUrl('/care/_private/onboarding');
        }

        return true;
      })
    );
  }
}

