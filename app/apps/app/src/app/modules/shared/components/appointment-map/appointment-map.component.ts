import { Component, Input } from '@angular/core';
import { AppointmentEntity, AppointmentStatus, AuthService, SpecialistUser } from '@app/ui';

const icons: string[] = [
  'teal',
  'red',
  'blue',
  'brown',
  'green',
  'orange',
  'violet',
  'yellow',
];

@Component({
  selector: 'app-appointment-map',
  templateUrl: './appointment-map.component.html',
  styleUrls: ['./appointment-map.component.scss']
})
export class AppointmentMapComponent {
  private _appointments: AppointmentEntity[];

  public specialists: SpecialistUser[];

  constructor(private readonly authService: AuthService) {}

  @Input()
  set appointments(appointments: AppointmentEntity[]) {
    this._appointments = appointments ? appointments.filter(appointment => appointment.status !== AppointmentStatus.Cancelled) : [];

    /* We will also map the specialists' home addresses - filter out all unique specialists... */
    this.specialists = Object.values(this._appointments.reduce((collector, appointment) => {
      const id = (appointment.specialist && appointment.specialist.id) || 'Unassigned';
      if (!collector[id]) {
        collector[id] = appointment.specialist;
      }

      return collector;
    }, {}));
  }

  get appointments() {
    return this._appointments;
  }

  getIconPath(specialist?: SpecialistUser) {
    /* Find the index of hte supplied specialist in the full set of specialists... */
    const id = specialist ? this.specialists.findIndex(s => s && s.id === specialist.id) : -1;
    return id > -1 ? this._getIconPath(icons[id % icons.length]) : this._getIconPath('default');
  }

  getAppointmentUri(appointment: AppointmentEntity) {
    return `${this.authService.getPortalUrl()}/appointments/${appointment.id}`;
  }

  private _getIconPath(colour: string) {
    return `assets/icons/location-pin-icon-${ colour }.svg`;
  }
}
