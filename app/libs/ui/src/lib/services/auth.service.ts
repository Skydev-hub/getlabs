import { HttpClient } from '@angular/common/http';
import { Injectable, Type } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as Sentry from '@sentry/browser';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import { AuthToken, DecodedAuthToken, PatientUser, SpecialistUser, StaffUser, User } from '../models';
import { compareEntities } from '../utils';
import { AnalyticsService, TagManagerUser } from './analytics.service';
import { ConfigurationService } from './configuration.service';
import { UserCrudService } from './user-crud.service';
import { UserService } from './user.service';

export const JWT_TOKEN_NAME = 'auth-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user$: BehaviorSubject<User>;

  private req$: Observable<User>;

  private updateReq$: Observable<User>;

  static getToken(): string {
    return localStorage ? localStorage.getItem(JWT_TOKEN_NAME) : null;
  }

  static setToken(token: string): void {
    if (localStorage) {
      localStorage.setItem(JWT_TOKEN_NAME, token);
    }
  }

  static removeToken(): void {
    if (localStorage) {
      localStorage.removeItem(JWT_TOKEN_NAME);
    }
  }

  constructor(
    private readonly userService: UserService,
    private readonly http: HttpClient,
    private readonly jwt: JwtHelperService,
    private readonly router: Router,
    private readonly analytics: AnalyticsService,
    private readonly config: ConfigurationService,
  ) {
    this.user$ = new BehaviorSubject(null);

    // Listen to changes in the authenticated user and update the error scope with their id
    this.user$.subscribe(user => {
      Sentry.configureScope(scope => {
        scope.setUser(user instanceof User ? { id: user.id } : null);
      });

      // Expose user identity information to tag manager
      this.analytics.pushToTagManagerDataLayer({
        user: user instanceof PatientUser ? new TagManagerUser(user) : undefined,
      });
    });
  }

  getUser(): User | null {
    return this.user$.getValue();
  }

  setUser(user: User) {
    this.user$.next(user);

    // Trigger tag manager event
    this.analytics.triggerTagManagerEvent(user ? 'sign-in' : 'sign-out');
  }

  freshen(user: User) {
    if (compareEntities(user, this.getUser())) {
      this.setUser(user);
    }
  }

  getAuthenticatedUser(skipCache?: boolean): Observable<User> {
    if (!this.isTokenValid()) {
      return of(null);
    }

    if (!skipCache) {
      const user = this.getUser();
      if (user) {
        return of(user);
      }
    }

    const token = this.getDecodedToken();

    if (!this.req$) {
      // Hot observable to share HTTP requests that occur simultaneously
      this.req$ = (this.updateReq$ ? this.updateReq$ : this.userService.get(token.type, token.id)).pipe(
        // Unset hot observable to issue new requests once this http request completes
        tap(() => this.req$ = null),

        // Set authenticated user
        tap(user => this.setUser(user)),

        // Share hot observable when multiple requests happen at once. This allows sharing the result
        // and prevents multiple HTTP requests.
        share(),
      );
    }

    return this.req$;
  }

  authByCode(type: Type<User>, username: string, source?: string, voice?: boolean, code?: string): Observable<AuthToken> {
    const endpoint = (() => {
      switch (type) {
        case SpecialistUser:
          return this.config.getApiEndPoint('auth/specialist');
        case StaffUser:
          return this.config.getApiEndPoint('auth/staff');
        default:
          return this.config.getApiEndPoint('auth');
      }
    })();

    return this.http.post<AuthToken>(endpoint, { username, source, code, voice }, {
      /* Always attach the analytics token for requests initiated by patient users / those accessing the patient sign-in endpoint. */
      headers: type === PatientUser && this.analytics.getAnalyticsUserToken() ? {
        'X-Analytics-Token': this.analytics.getAnalyticsUserToken(),
      } : null,
    }).pipe(
      // catchError(() => throwError('Invalid username or password')),
      tap(resp => {
        if (resp.token) {
          AuthService.setToken(resp.token);
        }
      }),
    );
  }

  authByKey(key: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(this.config.getApiEndPoint(`auth/${ key }`), null).pipe(
      tap(resp => {
        if (resp.token) {
          AuthService.setToken(resp.token);
        }
      }),
    );
  }

  changeNumber(phoneNumber: string, code?: string): Observable<AuthToken> {
    return this.http.post<AuthToken>(this.config.getApiEndPoint('auth/phone-number'), { phoneNumber, code }).pipe(
      tap(resp => {
        if (resp.token) {
          AuthService.setToken(resp.token);
        }
      }),
    );
  }

  signOut(redirectTo?: string) {
    AuthService.removeToken();
    this.setUser(null);

    if (redirectTo) {
      this.router.navigateByUrl(redirectTo);
    }
  }

  getPortalUrl(): string {
    return this.isTokenValid() ? this.userService.getPortalUrl(this.getDecodedToken().type) : '/';
  }

  update(data: Partial<PatientUser | SpecialistUser | StaffUser>) {
    if (!this.isTokenValid()) {
      throw new Error('Invalid token');
    }

    /* We're tracking the most recently invoked update */
    this.updateReq$ = this.getUserService().update(this.getUser().id, data).pipe(
      /* Ensures that multiple subscriptions to this observable will not result in multiple HTTP requests. */
      share(),

      /* Update the local user upon completion. */
      tap(user => this.setUser(user)),

      /* Release the updateReq$ prop as our most recent update is now complete. */
      tap(() => this.updateReq$ = null),
    );

    return this.updateReq$;
  }

  getUserService(): UserCrudService<User> {
    return this.userService.getService(this.getDecodedToken().type);
  }

  getDecodedToken(): DecodedAuthToken {
    return this.isTokenValid() ? this.jwt.decodeToken(AuthService.getToken()) : null;
  }

  isTokenValid(): boolean {
    return !this.jwt.isTokenExpired();
  }


}
