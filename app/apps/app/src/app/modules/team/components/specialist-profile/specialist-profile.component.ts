import { Component, Input, OnInit } from '@angular/core';
import {DocumentType, SpecialistDeactivationReasonLabels, SpecialistUser} from '@app/ui';
import {AccountStatusService} from '../../services/account-status.service';

@Component({
  selector: 'app-team-specialist-profile',
  templateUrl: './specialist-profile.component.html',
  styleUrls: ['./specialist-profile.component.scss']
})
export class SpecialistProfileComponent implements OnInit {

  @Input()
  user: SpecialistUser;

  DeactivationReasonLabels = SpecialistDeactivationReasonLabels;

  DocumentType = DocumentType;

  isReactivated: boolean;

  constructor(private accountStatus: AccountStatusService) {}

  ngOnInit() {
    if (!(this.user instanceof SpecialistUser)) {
      throw new TypeError('The input \'user\' must be an instance of SpecialistUser');
    }
  }

  updateUser(user: SpecialistUser) {
    this.user = user || this.user;
    this.isReactivated = this.user.isActive;
  }
}
