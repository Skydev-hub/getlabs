import { Component, Input, OnInit } from '@angular/core';
import { StaffUser } from '@app/ui';

@Component({
  selector: 'app-team-access-level',
  templateUrl: './access-level.component.html',
  styleUrls: ['./access-level.component.scss']
})
export class AccessLevelComponent implements OnInit {

  @Input()
  user: StaffUser;

  constructor() { }

  ngOnInit() {
    if (!this.user) {
      throw new TypeError('The input \'user\' is required');
    }

    if (!(this.user instanceof StaffUser)) {
      throw new TypeError('The input \'user\' must be an instance of StaffUser');
    }
  }

}
