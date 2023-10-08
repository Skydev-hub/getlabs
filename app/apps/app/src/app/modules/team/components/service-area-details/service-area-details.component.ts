import { Component, Input, OnInit } from '@angular/core';
import { ServiceAreaEntity } from '@app/ui';

@Component({
  selector: 'app-team-service-area-details',
  templateUrl: './service-area-details.component.html',
  styleUrls: ['./service-area-details.component.scss'],
})
export class ServiceAreaDetailsComponent implements OnInit {

  @Input()
  serviceArea: ServiceAreaEntity;

  ngOnInit() {
    if (!(this.serviceArea instanceof ServiceAreaEntity)) {
      throw new TypeError('The input \'serviceArea\' must be an instance of ServiceAreaEntity');
    }
  }

}
