import { ApplicationRef, Component, Inject, isDevMode, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  AnalyticsService,
  AuthService,
  ConfigurationService,
  DocumentMouseLeaveListenerOptions,
  LabCompany,
  MetaService,
  ReferralResolutionService,
} from '@app/ui';
import { addYears } from 'date-fns';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { CookieService } from 'ngx-cookie';
import { AsyncSubject, Subscription, timer } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { FirstVisitOptInDialogComponent } from './components/first-visit-opt-in-dialog/first-visit-opt-in-dialog.component';

const OPT_IN_COOKIE_KEY = 'GlOptIn';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public LabCompany = LabCompany;

  public documentMouseLeaveOptions: DocumentMouseLeaveListenerOptions;

  private modalTimerSub$: Subscription;

  private authSub$: Subscription;

  private matDialogRef: MatDialogRef<FirstVisitOptInDialogComponent>;

  private unsubscribe$ = new AsyncSubject<void>();

  constructor(
    private meta: MetaService,
    private analytics: AnalyticsService,
    // Not used, but imported to ensure that recaptcha is initialized on app boot to track users/bots throughout the site
    private recaptcha: ReCaptchaV3Service,
    private referralResolution: ReferralResolutionService,
    private readonly authService: AuthService,
    private readonly matDialog: MatDialog,
    private readonly appRef: ApplicationRef,
    private readonly ngZone: NgZone,
    private readonly cookieService: CookieService,
    private readonly config: ConfigurationService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    this.documentMouseLeaveOptions = {
      unsubscribe$: this.unsubscribe$.asObservable(),
    };
  }

  isSignedIn(): boolean {
    return !!this.authService.getUser();
  }

  ngOnInit() {
    this.meta.start();
    this.analytics.start();
    this.referralResolution.resolve();

    // if (isPlatformBrowser(this.platformId)) {
    this.appRef.isStable.pipe(first((stable) => stable)).subscribe(() =>
      this.ngZone.run(() => {
        /* If on the website for more than 60s, we will open the first visit opt in dialog. */
        this.modalTimerSub$ = timer(60000).subscribe(() => {
          if (!this.authService.getUser()) {
            this.autoOpenModal();
          }
        });

        /* If the user becomes authenticated at any point, ensure all of our launch triggers are stopped. */
        this.authSub$ = this.authService.user$.pipe(filter(Boolean)).subscribe(() => this.stopModal());
      })
    );
    // }
  }

  autoOpenModal(isLeaving?: boolean) {
    /* Examine the user's cookies - if they've already seen the opt-in modal, do not display it. */
    if (!this.cookieService.get(OPT_IN_COOKIE_KEY)) {
      this.openOptInModal(isLeaving);
    }
  }

  openOptInModal(isLeaving: boolean = false) {
    this.matDialogRef = this.matDialog.open(FirstVisitOptInDialogComponent, {
      panelClass: ['promo-modal', 'app-mat-dialog'],
      data: { isLeaving },
    });

    this.stopModal();

    /* Set a cookie indicating that the modal has been viewed. */
    this.cookieService.put(OPT_IN_COOKIE_KEY, 'true', {
      domain: this.config.getCookieDomain(),
      expires: addYears(new Date(), 2),
    });
  }

  ngOnDestroy(): void {
    this.meta.stop();
    this.analytics.stop();

    this.stopModal();

    if (this.authSub$) {
      this.authSub$.unsubscribe();
    }
  }

  private stopModal() {
    /* Clear any outstanding subscriptions... */
    if (this.modalTimerSub$) {
      this.modalTimerSub$.unsubscribe();
    }

    /* Fire an event indicating that the mouse detector procedure should be stopped. */
    if (!this.unsubscribe$.isStopped) {
      this.unsubscribe$.next();
      this.unsubscribe$.complete();
    }
  }
}
