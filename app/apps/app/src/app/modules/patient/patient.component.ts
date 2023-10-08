import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@app/ui';
import { of } from 'rxjs';
import { AwardType } from '../../../../../../libs/ui/src/lib/models/award-campaign.entity';
import { InactivityService } from '../shared/services/inactivity.service';

@Component({
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit, OnDestroy {

  constructor(
    private inactivity: InactivityService,
    private readonly authService: AuthService,
  ) { }

  public AwardType = AwardType;

  ngOnInit() {
    this.inactivity.start();
  }

  ngOnDestroy(): void {
    this.inactivity.stop();
  }

  getUser() {
    return this.authService.isTokenValid() ? this.authService.user$ : of(null);
  }

}
