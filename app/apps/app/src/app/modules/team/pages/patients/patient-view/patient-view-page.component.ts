import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientUser } from '@app/ui';

@Component({
  templateUrl: './patient-view-page.component.html',
  styleUrls: ['./patient-view-page.component.scss']
})
export class PatientViewPageComponent implements OnInit {

  user: PatientUser;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof PatientUser)) {
      throw new TypeError('The property \'user\' is required');
    }
  }

}
