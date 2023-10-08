import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StaffUser } from '@app/ui';

@Component({
  templateUrl: './team-member-view-page.component.html',
  styleUrls: ['./team-member-view-page.component.scss']
})
export class TeamMemberViewPageComponent implements OnInit {

  user: StaffUser;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof StaffUser)) {
      throw new TypeError('The property \'user\' must be an instance of StaffUser');
    }
  }

}
