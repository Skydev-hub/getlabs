import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Inject, OnInit, Directive } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentEntity, AppointmentBookingTypes } from '@app/ui';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SchedulerRestrictions } from '../../../shared/components/scheduler/scheduler.component';
import { AppointmentService } from '../../../shared/services/appointment.service';

@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix */
export class AbstractAppointmentBookingPageComponent implements OnInit {
  appointment: AppointmentEntity;

  AppointmentBookingTypes = AppointmentBookingTypes;

  days$: Observable<number>;

  restrictions: SchedulerRestrictions;

  formControl = new FormControl(null, Validators.required);

  constructor(
    @Inject(BreakpointObserver) protected readonly breakpointObserver: BreakpointObserver,
    @Inject(ActivatedRoute) protected readonly route: ActivatedRoute,
    @Inject(AppointmentService) protected readonly appointmentService: AppointmentService,
    @Inject(Router) protected readonly routerService: Router
  ) {}

  ngOnInit(): void {
    /* Extract the appointment from the router */
    this.appointment = this.route.snapshot.data.appointment;

    this.days$ = this.breakpointObserver.observe([Breakpoints.HandsetPortrait]).pipe(
      /* Emit the number of days we want to set according to whether or not the above breakpoint matches. */
      map((result) => (result.matches ? 3 : 5))
    );

    // this.restrictions = this.appointment && this.getRestrictions(this.appointment.labOrderDetails);
  }

  // getRestrictions(labOrderDetailsOrSeedType: LabOrderDetailsEntity[] | LabOrderSeedTypes) {
  //   const labOrderTypes = Array.isArray(labOrderDetailsOrSeedType) ? labOrderDetailsOrSeedType.map(lod => lod.getLabOrderType()) :
  //     (labOrderDetailsOrSeedType && [labOrderDetailsOrSeedType]) || [];
  //
  //   return !!labOrderTypes.find(lot => lot === LabOrderSeedTypes.DoctorContact) ?
  //     new SchedulerRestrictions(addBusinessDays(new Date(), 1)) : null;
  // }
}
