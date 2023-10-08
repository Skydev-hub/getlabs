import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnalyticsService, ConfigurationService } from '@app/ui';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { BookStep } from '../../../models/book-step.dto';

/**
 * AppointmentBookFlowService invokes remote endpoints that manage operations for the booking flow.
 */
@Injectable({
  providedIn: 'root',
})
export class AppointmentBookFlowService {

  constructor(
    private http: HttpClient,
    private analytics: AnalyticsService,
    private config: ConfigurationService,
  ) {
  }

  bookStep(step: BookStep, ordinal: number, stepData?: object): Observable<object> {
    return this.analytics.getAnalyticsUserToken$().pipe(
      switchMap(token => {
        const headers = {};

        /* Since failed requests are still regarded as complete (thanks Bart!), we may only attach the token if we know
         * (or are at least reasonably sure) it's valid. */
        if (!!token && typeof token === 'string') {
          headers['X-Analytics-Token'] = token;
        }

        return this.http.post(this.config.getApiEndPoint('appointment-book-flow/book-step'), { step, stepData, ordinal }, {
          headers,
        });
      }),
    );
  }
}
