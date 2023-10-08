import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnalyticsEventDto, OptInResult, OptInType } from '../models';
import { AnalyticsService } from './analytics.service';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class MarketingService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly analyticsService: AnalyticsService,
    private readonly config: ConfigurationService,
  ) {
  }

  optIn(optInType: OptInType) {
    return this.httpClient.post<OptInResult>(this.getPath('opt-in'), { optInType }, {
      headers: this.analyticsService.getAnalyticsHeaders(),
    });
  }

  logOptIn(optInType: OptInType, status: 'Viewed' | 'Start') {
    return this.analyticsService.trackEvent(new AnalyticsEventDto(`Opt-In: ${ status }`, { optInType }));
  }

  private getPath(endpoint?: string) {
    return this.config.getApiEndPoint(`marketing${ endpoint ? '/' + endpoint : '' }`);
  }
}
