import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthService, UserService } from '@app/ui';

/**
 * Ensures that a user is redirected to their appropriate portal if they access the sign-in page while already signed in
 */

@Injectable({
  providedIn: 'root',
})
export class NotSignedInGuard implements CanActivate, CanActivateChild {

  constructor(private auth: AuthService, private user: UserService, private router: Router) {}

  canActivate() {
    return this.canAccess();
  }

  canActivateChild() {
    return this.canAccess();
  }

  private canAccess() {

    const token = this.auth.getDecodedToken();

    if (!token) {
      return true;
    }

    return this.router.parseUrl(this.user.getPortalUrl(token.type));
  }

}
