import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentEntity } from '@app/ui';
import { AppointmentService } from '../services/appointment.service';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root'
})
export class AppointmentResolver extends CrudResolver<AppointmentEntity> {
  protected constructor(service: AppointmentService, router: Router, location: Location) {
    super(service, router, location);
  }
}
