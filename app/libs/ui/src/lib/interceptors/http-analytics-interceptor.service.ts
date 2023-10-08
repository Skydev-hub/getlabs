import { isPlatformServer } from '@angular/common';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AbTestsService } from '../services/ab-tests.service';
import { ConfigurationService } from '../services/configuration.service';

@Injectable({
  providedIn: 'root'
})
export class HttpAnalyticsInterceptorService implements HttpInterceptor {
  constructor(
    private readonly abTestsService: AbTestsService,
    private readonly config: ConfigurationService,
    @Inject(PLATFORM_ID) private platformId
  ) {}

  private getEventProperties() {
    const properties: { [key: string]: any } = {};
    // Fetch all active AB test versions
    const abTests = this.abTestsService.getActiveTestVersions();
    if (abTests) {
      properties.AbTests = abTests;
    }
    return Object.keys(properties).length === 0 ? null : properties;
  }

  /**
   * Intercepts all API request and sets the x-analytics-event-properties header. This is a series of key/value pairs that will be sent along with any tracked events.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const eventProperties = this.getEventProperties();
    if (eventProperties && req.url.startsWith(this.config.getApiEndPoint()) && !isPlatformServer(this.platformId)) {
      const json = JSON.stringify(eventProperties);
      req = req.clone({
        setHeaders: {
          'x-analytics-event-properties': btoa(json)
        }
      });
    }
    return next.handle(req);
  }
}
