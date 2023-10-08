import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LabLocationEntity, LabLocationService } from '@app/ui';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root'
})
export class LabLocationResolver extends CrudResolver<LabLocationEntity> {
  protected constructor(service: LabLocationService, router: Router, location: Location) {
    super(service, router, location);
  }
}
