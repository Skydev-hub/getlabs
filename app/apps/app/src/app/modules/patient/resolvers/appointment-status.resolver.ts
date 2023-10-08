import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AppointmentEntity, AppointmentStatus, AuthService, PatientUserService } from '@app/ui';
import { addDays, isAfter } from 'date-fns';
import { head } from 'lodash-es';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppointmentStatusResolver implements Resolve<AppointmentEntity> {
  protected constructor(private service: PatientUserService, private auth: AuthService, private router: Router) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<AppointmentEntity> {
    return this.auth.getAuthenticatedUser().pipe(
      switchMap((user) => this.service.appointments(user, { limit: '1' })),
      map(apps => {
        const app = head(apps);
        switch (true) {
          // Redirect back to booking flow if:
          //  - there is no existing appointment
          //  - it has been cancelled and its more than 1 day after
          //  - it has been completed and its more than 5 days after
          case !app:
          case app.status === AppointmentStatus.Cancelled && isAfter(new Date, addDays(app.endAt, 1)):
          case app.status === AppointmentStatus.Completed && isAfter(new Date, addDays(app.endAt, 5)):
            this.router.navigateByUrl('/book');
            return null;
          default:
            return app;
        }
      }),
    );
  }
}
