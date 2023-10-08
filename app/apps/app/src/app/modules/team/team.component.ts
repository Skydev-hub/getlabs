import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/ui';
import { InactivityService } from '../shared/services/inactivity.service';

@Component({
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit, OnDestroy {

  constructor(public router: Router, private inactivity: InactivityService, public auth: AuthService) { }

  ngOnInit() {
    this.inactivity.start();
  }

  ngOnDestroy(): void {
    this.inactivity.stop();
  }

}
