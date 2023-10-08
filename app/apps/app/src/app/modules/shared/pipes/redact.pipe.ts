import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentEntity, StaffUser } from '@app/ui';
import { AuthService } from '@app/ui';

@Pipe({
  name: 'redact'
})
export class RedactPipe implements PipeTransform {

  private readonly redact: boolean = true;

  constructor(private auth: AuthService) {

    const user = this.auth.getUser();

    if (user && user instanceof StaffUser) {
      this.redact = false;
    }
  }


  transform(appointment: AppointmentEntity): AppointmentEntity | null {
    return this.redact && !appointment.isViewable() ? null : appointment;
  }
}
