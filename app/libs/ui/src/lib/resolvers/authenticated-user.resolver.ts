import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedUserResolver implements Resolve<User> {

  constructor(
    private auth: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }

    return this.auth.getAuthenticatedUser(true);
  }
}
