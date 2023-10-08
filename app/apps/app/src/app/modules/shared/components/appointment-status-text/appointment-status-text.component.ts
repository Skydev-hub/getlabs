import { Component, Input, OnInit } from '@angular/core';
import { isAfter, max } from 'date-fns';
import { AppointmentCancelReason, AppointmentEntity, AppointmentStatus, StaffUser } from '@app/ui';
import { AuthService } from '@app/ui';

@Component({
  selector: 'app-appointment-status-text',
  templateUrl: './appointment-status-text.component.html',
  styleUrls: ['./appointment-status-text.component.scss'],
  host: {
    '[class]': '"status-"+appointment.status'
  }
})
export class AppointmentStatusTextComponent implements OnInit {

  @Input()
  appointment: AppointmentEntity;

  Status = AppointmentStatus;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The input \'appointment\' must be an instance of AppointmentEntity');
    }
  }

  /**
   * Determines if any of the attached files have been updated since the status of the appointment was changed.
   *
   * This is used to determine if a appointment should be mark as "updated" for certain statuses.
   */
  hasUpdatedFiles(appointment: AppointmentEntity): boolean {
    const files = [
      ...(appointment.labOrderDetails ? appointment.labOrderDetails.reduce((collector, lod) => {
        return collector.concat(lod.labOrderFiles || []);
      }, []) : []),
      appointment.patient.insurance.front,
      appointment.patient.insurance.rear,
    ];

    const dates = files.map(f => f ? f.createdAt : undefined).filter(Boolean);

    return isAfter(max(dates), appointment.statusDate);
  }

  isRebooked(appointment: AppointmentEntity): boolean {
    return appointment.cancelReason === AppointmentCancelReason.Rebooked;
  }

  isStaffUser(): boolean {
    return this.auth.getUser() instanceof StaffUser;
  }

}
