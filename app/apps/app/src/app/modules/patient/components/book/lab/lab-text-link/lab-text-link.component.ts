import { Component, OnInit } from '@angular/core';
import { AppointmentService } from '../../../../../shared/services/appointment.service';
import { AuthService } from '@app/ui';
import { AbstractLabComponent } from '../abstract-lab-component/abstract-lab.component';

/**
 * Continues the lab upload workflow on the patient's mobile.  Employed as part of the lab order collection preferences workflow.
 */
@Component({
  templateUrl: './lab-text-link.component.html',
  styleUrls: ['./lab-text-link.component.scss']
})
export class LabTextLinkComponent extends AbstractLabComponent implements OnInit {
  public req$: Promise<void>;

  constructor(private auth: AuthService, private appointments: AppointmentService) {
    super();
  }

  ngOnInit(): void {
    this.sendMobileLink();
  }

  sendMobileLink(): void {
    this.req$ = this.appointments.continueOnMobile().toPromise();
  }

  getUser() {
    return this.auth.getUser();
  }
}
