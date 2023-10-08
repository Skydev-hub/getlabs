import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PatientUser, PatientUserService } from '@app/ui';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root',
})
export class PatientResolver extends CrudResolver<PatientUser> {
  protected constructor(service: PatientUserService, router: Router, location: Location) {
    super(service, router, location);
  }
}
