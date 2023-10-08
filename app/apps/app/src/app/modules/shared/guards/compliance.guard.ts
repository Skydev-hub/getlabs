import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '@app/ui';


@Injectable({
  providedIn: 'root'
})
export abstract class ComplianceGuard implements CanActivate, CanActivateChild {
  protected constructor(private auth: AuthService, private router: Router) {}

  abstract getRedirectUrl(): string;

  canActivate() {
    return this.canAccess();
  }

  canActivateChild() {
    return this.canAccess();
  }

  private canAccess() {
    return this.auth.getAuthenticatedUser().pipe(
      map(user => !user.isHIPAACompliant() ? this.router.parseUrl(this.getRedirectUrl()) : true),
    );
  }
}
