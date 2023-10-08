import { PlatformModule } from '@angular/cdk/platform';
import { isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, PLATFORM_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService, ConfigurationService, UiModule } from '@app/ui';
import { JWT_OPTIONS, JwtModule } from '@auth0/angular-jwt';
import { CookieModule } from 'ngx-cookie';
import { DEFAULT_INTERRUPTSOURCES, Idle, NgIdleModule } from '@app/idle';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './modules/shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    // HttpClientModule should only be imported in the root module to prevent issues with JWT interceptor
    HttpClientModule,

    // Used to determine which type of platform we're on (mobile or desktop)
    PlatformModule,

    // Libraries
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        deps: [PLATFORM_ID, ConfigurationService],
        useFactory: (platformId: Object, config: ConfigurationService) => {
          return {
            tokenGetter: () => isPlatformBrowser(platformId) ? AuthService.getToken() : null,
            allowedDomains: [new URL(config.getApiEndPoint()).host],
            disallowedRoutes: ['/auth', '/auth/specialist', '/auth/staff'],
          };
        },
      },
    }),
    NgIdleModule.forRoot(),
    CookieModule.forRoot(),

    // Custom Modules
    AppRoutingModule,
    SharedModule,

    // Shared UI Components
    UiModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (idle: Idle) => {
        return () => {
          // Setup default idle parameters for the entire app
          idle.setIdle(30 * 60);  // Max 30 min idle time
          idle.setTimeout(60);    // 60 second warning before forced sign out
          idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        };

      },
      deps: [Idle],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
