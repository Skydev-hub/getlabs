import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StaffUser, StaffUserService } from '@app/ui';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root',
})
export class StaffResolver extends CrudResolver<StaffUser> {
  protected constructor(service: StaffUserService, router: Router, location: Location) {
    super(service, router, location);
  }
}
