import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, PLATFORM_ID } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserModule, ɵgetDOM } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService, ConfigurationService, LabPipe, UiModule } from '@app/ui';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { ReviewsComponent } from './pages/home/reviews/reviews.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { CookieModule } from 'ngx-cookie';
import { PrebootModule } from 'preboot';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { Covid19SafetyDialogComponent } from './components/covid-19-safety/covid-19-safety-dialog.component';
import { CtaBlockComponent } from './components/cta-block/cta-block.component';
import { FirstVisitOptInDialogComponent } from './components/first-visit-opt-in-dialog/first-visit-opt-in-dialog.component';
import { HeaderComponent } from './components/header/header.component';
import { SmallHeroComponent } from './components/small-hero/small-hero.component';
import { LabPageHeroComponent } from './components/lab-page-hero/lab-page-hero.component';
import { MobileNavComponent } from './components/mobile-nav/mobile-nav.component';
import { NoteBlockComponent } from './components/note-block/note-block.component';
import { PriceTransparencyBlockComponent } from './components/price-transparency-block/price-transparency-block.component';
import { LAB_PIPE } from './injection.constants';
import { AboutPageComponent } from './pages/about/about-page.component';
import { BackersComponent } from './pages/about/backers/backers.component';
import { MissionComponent } from './pages/about/mission/mission.component';
import { TeamComponent } from './pages/about/team/team.component';
import { CitiesComingSoonComponent } from './pages/cities/cities-coming-soon/cities-coming-soon.component';
import { CitiesPageComponent } from './pages/cities/cities-page.component';
import { CurrentCitiesComponent } from './pages/cities/current-cities/current-cities.component';
import { ContactPageComponent } from './pages/contact/contact-page.component';
import { FaqPageComponent } from './pages/faq/faq-page.component';
import { BenefitsComponent } from './pages/home/benefits/benefits.component';
import { HomeHeroComponent } from './pages/home/home-hero/home-hero.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { HowGetlabsWorksComponent } from './pages/home/how-getlabs-works/how-getlabs-works.component';
import { SpecialistsComponent } from './pages/home/specialists/specialists.component';
import { LabsPageComponent } from './pages/labs/labs-page.component';
import { LocationDetailsPageComponent } from './pages/labs/location-details/location-details-page.component';
import { PaymentsPageComponent } from './pages/legal/payments/payments-page.component';
import { PrivacyPageComponent } from './pages/legal/privacy/privacy-page.component';
import { TermsPageComponent } from './pages/legal/terms/terms-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { ProvidersContactComponent } from './pages/providers/contact/contact.component';
import { ProvidersFAQComponent } from './pages/providers/faq/faq.component';
import { HowProvidersWorksComponent } from './pages/providers/how-providers-works/how-providers-works.component';
import { ProvidersHeroComponent } from './pages/providers/providers-hero/providers-hero.component';
import { ProvidersPageComponent } from './pages/providers/providers-page.component';
import { RoutingModule } from './routing.module';
import { BookWithAddressComponent } from './components/book-with-address/book-with-address.component';

@NgModule({
  declarations: [
    AppComponent,

    // Pages
    HomePageComponent,
    HomeHeroComponent,
    HowGetlabsWorksComponent,
    ReviewsComponent,
    BenefitsComponent,
    SpecialistsComponent,

    AboutPageComponent,
    MissionComponent,
    TeamComponent,
    BackersComponent,

    CitiesPageComponent,
    CurrentCitiesComponent,
    CitiesComingSoonComponent,

    PrivacyPageComponent,
    TermsPageComponent,
    PaymentsPageComponent,
    FaqPageComponent,
    ContactPageComponent,

    ProvidersPageComponent,
    ProvidersHeroComponent,
    HowProvidersWorksComponent,
    ProvidersContactComponent,
    ProvidersFAQComponent,

    NotFoundPageComponent,
    LabsPageComponent,
    LocationDetailsPageComponent,

    // Components
    HeaderComponent,
    PriceTransparencyBlockComponent,
    CtaBlockComponent,
    NoteBlockComponent,
    MobileNavComponent,
    LabPageHeroComponent,
    SmallHeroComponent,
    FirstVisitOptInDialogComponent,
    Covid19SafetyDialogComponent,
    BookWithAddressComponent,
  ],
  entryComponents: [MobileNavComponent, FirstVisitOptInDialogComponent, Covid19SafetyDialogComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'getlabs-web' }),
    BrowserAnimationsModule,
    PrebootModule.withConfig({ appRoot: 'app-root' }),
    TransferHttpCacheModule,
    RoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    GoogleMapsModule,

    // HttpClientModule should only be imported in the root module to prevent issues with JWT interceptor
    HttpClientModule,

    // Third-party modules
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        deps: [PLATFORM_ID, ConfigurationService],
        useFactory: (platformId: Object, config: ConfigurationService) => {
          return {
            tokenGetter: () => (isPlatformBrowser(platformId) ? AuthService.getToken() : null),
            whitelistedDomains: [new URL(config.getApiEndPoint()).host],
            blacklistedRoutes: ['/auth', '/auth/specialist', '/auth/staff'],
          };
        },
      },
    }),
    RecaptchaV3Module,
    CookieModule.forRoot(),

    // Shared UI Components
    UiModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptchaV3SiteKey,
    },

    // Angular SSR has an issue with swapping server rendered HTML with client rendered HTML which
    // results in a flash of unstyled content. The following code mostly patches the problem, but
    // it still exists to some extent. See: https://github.com/angular/preboot/issues/75#issuecomment-534661790
    {
      provide: APP_INITIALIZER,
      useFactory: function (document: HTMLDocument, platformId: Object): Function {
        return () => {
          if (isPlatformBrowser(platformId)) {
            const dom = ɵgetDOM();
            const styles: any[] = Array.prototype.slice.apply(dom.getDefaultDocument().querySelectorAll(`style[ng-transition]`));
            styles.forEach((el) => {
              // Remove ng-transition attribute to prevent Angular appInitializerFactory
              // to remove server styles before preboot complete
              el.removeAttribute('ng-transition');
            });
            document.addEventListener('PrebootComplete', () => {
              // After preboot complete, remove the server scripts
              setTimeout(() => styles.forEach((el) => dom.remove(el)));
            });
          }
        };
      },
      deps: [DOCUMENT, PLATFORM_ID],
      multi: true,
    },
    {
      provide: LAB_PIPE,
      useClass: LabPipe,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
