import {Component, Input, OnInit} from '@angular/core';
import {DocumentType, StaffDeactivationReasonLabels, StaffUser} from '@app/ui';

@Component({
  selector: 'app-team-team-member-profile',
  templateUrl: './team-member-profile.component.html',
  styleUrls: ['./team-member-profile.component.scss']
})
export class TeamMemberProfileComponent implements OnInit {

  @Input()
  user: StaffUser;

  DeactivationReasonLabels = StaffDeactivationReasonLabels;

  constructor() { }

  ngOnInit() {
    if (!(this.user instanceof StaffUser)) {
      throw new TypeError('The input \'user\' must be an instance of StaffUser');
    }
  }
}
