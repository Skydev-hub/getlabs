import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '@app/ui';


@Injectable({
  providedIn: 'root'
})
export class AuthByKeyGuard implements CanActivate, CanActivateChild {
  protected constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot) {
    return this.canAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot) {
    return this.canAccess(route);
  }

  private canAccess(route: ActivatedRouteSnapshot) {
    this.auth.signOut();
    return this.auth.authByKey(route.params['key']).pipe(
      catchError(() => of({ redirect: '/' })),
      map(token => this.redirect(token.redirect ? token.redirect : this.auth.getPortalUrl()))
    );
  }

  private redirect(path: string) {
    return this.router.parseUrl(path);
  }
}
