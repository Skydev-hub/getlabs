import { Injectable } from '@angular/core';
import { AppointmentSampleEntity, CrudService } from '@app/ui';


@Injectable({
  providedIn: 'root',
})
export class AppointmentSampleService extends CrudService<AppointmentSampleEntity> {
  getResourceType() {
    return AppointmentSampleEntity;
  }

  getResourceEndpoint(): string {
    return 'appointment-sample';
  }
}
