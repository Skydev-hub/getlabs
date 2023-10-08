import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SpecialistUser} from '@app/ui';
import {AccountStatusService} from '../../services/account-status.service';

@Component({
  selector: 'app-specialist-status-message',
  templateUrl: './specialist-status-message.component.html',
  styleUrls: ['./specialist-status-message.component.scss']
})
export class SpecialistStatusMessageComponent {
  @Input()
  user: SpecialistUser;

  @Output()
  statusChange = new EventEmitter<SpecialistUser>();

  constructor(private accountStatus: AccountStatusService) {}

  public openReactivationDialog() {
    this.accountStatus.openReactivateDialog(this.user).afterClosed().subscribe(user => {
      this.user = user || this.user;

      this.statusChange.emit(user);
    });
  }
}
