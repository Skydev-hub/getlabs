import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SpecialistUser } from '@app/ui';

@Component({
  templateUrl: './specialist-view-page.component.html',
  styleUrls: ['./specialist-view-page.component.scss']
})
export class SpecialistViewPageComponent implements OnInit {

  user: SpecialistUser;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof SpecialistUser)) {
      throw new TypeError('The property \'user\' must be an instance of SpecialistUser');
    }
  }
}
