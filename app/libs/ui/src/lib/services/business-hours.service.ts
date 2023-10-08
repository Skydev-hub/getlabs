import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessHoursConfig } from '../models/config.dto';
import { AppConfigService } from './app-config.service';
import { SimpleTime, SimpleTimeRange } from '../utils/time.utils';

@Injectable({
  providedIn: 'root',
})
export class BusinessHoursService {
  constructor(private readonly appConfigService: AppConfigService) {

  }

  getBusinessHours$(): Observable<SimpleTimeRange> {
    return combineLatest([
      this.appConfigService.get$(BusinessHoursConfig.BusinessHoursStart),
      this.appConfigService.get$(BusinessHoursConfig.BusinessHoursEnd),
    ]).pipe(
      map(strBoundsSet => {
        /* Convert each bound to SimpleTime objects, then return a SimpleTimeRange object composed of the two.
         * If either of the values come back as null due to a retrieval exception, we will need to set default bounds
         * for each value, so that consumers aren't left to dry. */
        const start = (strBoundsSet[0] && new SimpleTime(strBoundsSet[0])) || new SimpleTime(0, 0);
        const end = (strBoundsSet[1] && new SimpleTime(strBoundsSet[1])) || new SimpleTime(23, 59);

        return new SimpleTimeRange(start, end);
      })
    )
  }
}
