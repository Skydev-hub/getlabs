import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnalyticsService, AppointmentEntity, ConfigurationService, SpecialistUser } from '@app/ui';
import { plainToClass } from 'class-transformer';
import { format as formatDate } from 'date-fns';
import { filterFalsy } from 'libs/ui/src/lib/utils/http.utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppointmentSchedule, DaySlots, Timeslot } from '../../../models/timeslot.dto';

export interface RangeQueryOptions {
  from?: Date;
  days?: number;
  specialist?: SpecialistUser;
  appointment?: AppointmentEntity;
  zip?: string;
}

/**
 * Consumer interface for invoking remote API operations that manage timeslot availability
 */
@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {

  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfigurationService,
    private readonly analytics: AnalyticsService,
  ) {
  }

  /**
   * Retrieves the timeslot availability for the supplied type, on the supplied days, in the supplied timezone.
   */
  availability(type: string, dates: Date[], timezone: string, specialist?: SpecialistUser): Observable<Timeslot[]> {
    const days = dates.map(date => formatDate(date, 'yyyy-MM-dd')).join(',');
    return this.http.get<Timeslot[]>(
      this.config.getApiEndPoint(`availability/timeslots/${ type }/${ days }`),
      {
        params: filterFalsy({ timezone, specialist: specialist ? specialist.id : undefined }),
      },
    ).pipe(
      map(res => plainToClass(Timeslot, res)),
    );
  }

  upcomingTimeslots(type: string, timezone: string, options: RangeQueryOptions = {}): Observable<AppointmentSchedule> {
    return this.http.get<AppointmentSchedule>(this.config.getApiEndPoint(`availability/upcoming-timeslots/${ type }`), {
      headers: this.analytics.getAnalyticsUserToken() ? {
        'X-Analytics-Token': this.analytics.getAnalyticsUserToken(),
      } : null,
      params: filterFalsy({
        timezone,
        days: options.days && options.days.toString(10),
        from: options.from && formatDate(options.from, 'yyyy-MM-dd'),
        specialist: options.specialist ? options.specialist.id : undefined,
        appointment: options.appointment ? options.appointment.id : undefined,
        zip: options.zip
      }),
    }).pipe(
      map(res => {
        if (res && res.data) {
          res.data = res.data.map(dailySlots => plainToClass(DaySlots, dailySlots));
        }
        return res;
      }),
    );
  }
}
