import { Injectable, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '@app/ui';

const Status: { [key in AppointmentStatus]: string } = {
  [AppointmentStatus.Collected]: 'Collected',
  [AppointmentStatus.Confirmed]: 'Confirmed',
  [AppointmentStatus.Pending]: 'Pending',
  [AppointmentStatus.InProgress]: 'In Progress',
  [AppointmentStatus.Completed]: 'Completed',
  [AppointmentStatus.EnRoute]: 'En Route',
  [AppointmentStatus.Incomplete]: 'Incomplete',
  [AppointmentStatus.Cancelled]: 'Cancelled',
};

@Injectable({
  providedIn: 'root'
})
export class StatusPipe implements PipeTransform {

  public static getStatusString(status: AppointmentStatus) {
    return Status[status] || '';
  }

  transform(value: AppointmentStatus): any {
    return StatusPipe.getStatusString(value);
  }
}
