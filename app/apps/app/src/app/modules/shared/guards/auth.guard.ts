import { Injectable, Type } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '@app/ui';
import { AuthService } from '@app/ui';

/**
 * Ensures that a user has a valid JWT token
 */
@Injectable({
  providedIn: 'root'
})
export abstract class AuthGuard implements CanLoad, CanActivate, CanActivateChild {
  constructor(private auth: AuthService) {}

  abstract getUserType(): Type<User>;

  abstract getRedirectUrl(): string;

  canLoad() {
    return this.canAccess();
  }

  canActivate() {
    return this.canAccess();
  }

  canActivateChild() {
    return this.canAccess();
  }

  private canAccess() {
    return this.auth.getAuthenticatedUser().pipe(
      catchError(() => {
        this.redirect();
        return of(false);
      }),
      map(user => user instanceof this.getUserType()),
      tap(user => {

        if (!user) {
          this.redirect();
        }
      })
    );
  }

  private redirect() {
    this.auth.signOut(this.getRedirectUrl());
  }
}
