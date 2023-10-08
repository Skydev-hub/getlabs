import { Injectable } from '@angular/core';
import { ServiceAreaEntity } from '../models';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root',
})
export class ServiceAreaService extends CrudService<ServiceAreaEntity> {

  getResourceType() {
    return ServiceAreaEntity;
  }

  getResourceEndpoint(): string {
    return 'service-area';
  }
}
