import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppointmentEntity, AppointmentStatus } from '@app/ui';

@Component({
  templateUrl: './appointment-view-page.component.html',
  styleUrls: ['./appointment-view-page.component.scss']
})
export class AppointmentViewPageComponent implements OnInit {

  appointment: AppointmentEntity;

  // Bind enums to component for use in the template
  Status = AppointmentStatus;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.appointment = this.route.snapshot.data.appointment;

    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The property \'appointment\' must be an instance of AppointmentEntity');
    }
  }

}
