import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SpecialistUser, SpecialistUserService } from '@app/ui';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root',
})
export class SpecialistResolver extends CrudResolver<SpecialistUser> {
  protected constructor(service: SpecialistUserService, router: Router, location: Location) {
    super(service, router, location);
  }
}
