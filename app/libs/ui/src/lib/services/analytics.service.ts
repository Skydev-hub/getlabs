import { DOCUMENT, isPlatformBrowser, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, isDevMode, PLATFORM_ID, Renderer2, RendererFactory2, Type } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { plainToClass } from 'class-transformer';
import { addYears } from 'date-fns';
import * as md5 from 'md5';
import { CookieService } from 'ngx-cookie';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { RouterAnalyticsEvent } from '../events/router-analytics.event';
import { PatientUser, ReferralEmbed, User, WebEntryResponseDto } from '../models';
import { AnalyticsEventDto, AnalyticsResponseDto, WebEntryDto } from '../models/analytics.dto';
import { searchParamsToObject, WindowRef } from '../utils';
import { ConfigurationService } from './configuration.service';
import { ReferrerService } from './referrer.service';
import { TagManagerService } from './tag-manager.service';

/* Ensures that typescript does not flag usages of the gtag function.  This can be extended (and probably removed) later through the use of
 * the @types/gtag.js package, but we don't need that just yet. */
declare let gtag: Function;

/**
 * Indicates the method that is responsible for resolving the inbound referrer object.
 */
export type ReferrerResolutionMethod = 'WebEntry' | 'Local' | Type<User>;

/**
 * Describes the inbound referrer, as well as the method responsible for resolving said referrer.
 */
export interface ReferralResolve {
  referral: ReferralEmbed,
  method: ReferrerResolutionMethod,
}

export class TagManagerUser {
  id: string;
  email: string;
  createdAt: string;
  name: string;
  phoneNumber: string;
  avatar: string;
  intercomIdentityHash: string;

  constructor(user: PatientUser) {
    this.id = user.id;
    this.email = user.email;
    this.createdAt = (user.createdAt.getTime() / 1000).toFixed(0);
    this.name = user.name;
    this.phoneNumber = user.phoneNumber;
    this.avatar = this.email ? `https://www.gravatar.com/${ md5(this.email.trim()) }` : undefined;
    this.intercomIdentityHash = user.intercomIdentityHash;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {

  private static readonly AnalyticsUserToken = 'AnalyticsUserToken';

  scriptEl: any;

  router$: Subscription;

  renderer: Renderer2;

  private analyticsToken$: BehaviorSubject<string>;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly window: WindowRef,
    private readonly router: Router,
    private readonly httpClient: HttpClient,
    private readonly location: Location,
    private readonly tagManager: TagManagerService,
    private readonly cookieService: CookieService,
    private readonly referrerService: ReferrerService,
    private readonly config: ConfigurationService,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.analyticsToken$ = new BehaviorSubject<string>(this.getAnalyticsUserToken() || null);
  }

  start(): void {
    // Skip this code if this page is not being rendered on a browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.tagManager.init();

    /* Ensures every router transition is captured */
    this.router$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe((event: NavigationEnd) => {
      const url = new URL(event.url, this.document.location.origin);
      this.trackEvent(new RouterAnalyticsEvent({
        targetDestination: url.pathname,
        queryParams: searchParamsToObject(url.searchParams),
        source: this.router.url,
        redirectedDestination: event.url !== event.urlAfterRedirects ? event.urlAfterRedirects : null,
        isRedirected: event.url !== event.urlAfterRedirects,
        domain: url.hostname,
      })).subscribe();
    });
  }

  stop(): void {
    // Skip this code if this page is not being rendered on a browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.router$.unsubscribe();
    this.renderer.removeChild(this.document.body, this.scriptEl);
  }

  /**
   * Sets the supplied analytics user token in local browser storage.
   */
  private setAnalyticsUserToken(token: string) {
    this.cookieService.put(AnalyticsService.AnalyticsUserToken, token, {
      domain: this.config.getCookieDomain(),
      expires: addYears(new Date(), 2),
    });

    /* Set to the subject */
    this.analyticsToken$.next(token);
  }

  public getAnalyticsUserToken$() {
    return this.analyticsToken$.asObservable();
  }

  /**
   * Retrieves from browser storage the analytics user token currently set for this user.
   */
  public getAnalyticsUserToken() {
    return this.cookieService.get(AnalyticsService.AnalyticsUserToken);
  }

  /**
   * Dispatches a request to the backend to track the supplied analytics event.
   */
  public trackEvent(event: AnalyticsEventDto) {
    // Skip this code if this page is not being rendered on a browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    /* Invoke the API endpoint with the analytics object */
    return this.analyticsToken$.pipe(
      filter(token => !!token),
      switchMap(token => {
        /* Attach the distinct_id to the outbound object, if it's not already provided */
        event.getData().distinct_id = token;

        return this.httpClient.post<AnalyticsResponseDto>(this.getPath(), event, {
          headers: this.getHeaders(token),
        });
      }));
  }

  /**
   * Dispatches a request to the web entry API for tracking the entry circumstances of the
   * current user.
   */
  public webEntry(referral: ReferralEmbed) {
    const url = new URL(this.document.location.href);
    const webEntryDto: WebEntryDto = {
      referrerType: (referral && referral.referralMethod),
      referrerUri: this.document.referrer,
      isCrawler: /bot|crawler|spider|crawling/i.test(window.navigator.userAgent),
      data: (referral && referral.data),
      targetDestination: url.pathname,
      queryParams: searchParamsToObject(url.searchParams),
      domain: this.document.location.hostname,
    };

    return this.httpClient.post<WebEntryResponseDto>(this.getPath('web-entry'), webEntryDto,
      {
        headers: this.getHeaders(this.getAnalyticsUserToken()),
      }).pipe(
      tap(resp => {
        this.setAnalyticsUserToken(resp.distinct_id);
        this.referrerService.setReferrer(plainToClass(ReferralEmbed, resp.referral), 'WebEntry');
      }),
      map(resp => {
        return resp.referral;
      }),
    );
  }

  /**
   * Issues a custom event via Google Tag Manager.
   *
   * The custom event passed to this method should be set up as a trigger in
   * GTM for a specific Google Ads Conversion Tracking tag.
   *
   * @param event Event name that GTM picks up
   * @param data Extra data to include in the event
   */
  public triggerTagManagerEvent(event: string, data?: object) {
    // Skip this code if this page is not being rendered on a browser
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.tagManager.getDataLayer().push({
      event, ...data,
    });
  }

  public pushToTagManagerDataLayer(o: any) {
    this.tagManager.getDataLayer().push(o);
  }

  public getAnalyticsHeaders() {
    return this.getAnalyticsUserToken() ? this.getHeaders(this.getAnalyticsUserToken()) : {};
  }

  private getHeaders(token: string) {
    return token ? {
      'X-Analytics-Token': token,
    } : {};
  }

  private getPath(path?: string) {
    return this.config.getApiEndPoint(`analytics${ (path && ('/' + path)) || '' }`);
  }
}
