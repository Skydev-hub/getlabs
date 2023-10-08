import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceAreaEntity, ServiceAreaService } from '@app/ui';
import { CrudResolver } from './crud.resolver';

@Injectable({
  providedIn: 'root',
})
export class ServiceAreaResolver extends CrudResolver<ServiceAreaEntity> {
  protected constructor(service: ServiceAreaService, router: Router, location: Location) {
    super(service, router, location);
  }
}
