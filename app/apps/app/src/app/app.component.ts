import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService, MetaService, ReferralResolutionService } from '@app/ui';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform,
    private renderer: Renderer2,
    private meta: MetaService,
    private analyticsService: AnalyticsService,
    private referralResolver: ReferralResolutionService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    /* Start the analytics tracking logic */
    this.analyticsService.start();
    this.referralResolver.resolve();

    this.renderer.addClass(this.document.body, this.isMobile() ? 'is-mobile' : 'is-desktop');
    this.meta.start();
  }

  ngOnDestroy(): void {
    this.meta.stop();
    this.analyticsService.stop();
  }

  // ---

  private isMobile(): boolean {
    return this.platform.IOS || this.platform.ANDROID;
  }
}
