import { Component, OnDestroy, OnInit } from '@angular/core';
import { InactivityService } from '../shared/services/inactivity.service';

@Component({
  templateUrl: './specialist.component.html',
  styleUrls: ['./specialist.component.scss']
})
export class SpecialistComponent implements OnInit, OnDestroy {

  constructor(private inactivity: InactivityService) { }

  ngOnInit() {
    this.inactivity.start();
  }

  ngOnDestroy(): void {
    this.inactivity.stop();
  }

}
