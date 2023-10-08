import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceAreaEntity } from '@app/ui';

@Component({
  templateUrl: './service-area-view-page.component.html',
  styleUrls: ['./service-area-view-page.component.scss'],
})
export class ServiceAreaViewPageComponent implements OnInit {

  serviceArea: ServiceAreaEntity;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.serviceArea = this.route.snapshot.data.serviceArea;

    if (!(this.serviceArea instanceof ServiceAreaEntity)) {
      throw new TypeError('The property \'serviceArea\' must be an instance of ServiceAreaEntity');
    }
  }
}
