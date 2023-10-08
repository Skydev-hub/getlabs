import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppointmentEntity } from '@app/ui';

@Component({
  templateUrl: './appointment-status-page.component.html',
  styleUrls: ['./appointment-status-page.component.scss']
})
export class AppointmentStatusPageComponent implements OnInit {
  appointment?: AppointmentEntity;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.appointment = this.route.snapshot.data.appointment;
  }
}
