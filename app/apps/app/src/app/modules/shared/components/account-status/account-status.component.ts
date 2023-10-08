import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  enumValues,
  PatientDeactivationReason,
  PatientDeactivationReasonLabels,
  PatientUser,
  SpecialistDeactivationReason,
  SpecialistDeactivationReasonLabels,
  SpecialistUser,
  StaffDeactivationReason,
  StaffDeactivationReasonLabels,
  StaffUser,
  User,
} from '@app/ui';
import {
  AccountDeactivationDialogData,
  AccountDeactivationReasonOption,
} from '../../../team/components/dialog/account-deactivation-dialog/account-deactivation-dialog-data.interface';
import { AccountDeactivationDialogComponent } from '../../../team/components/dialog/account-deactivation-dialog/account-deactivation-dialog.component';
import { AccountReactivationDialogData } from '../../../team/components/dialog/account-reactivation-dialog/account-reactivation-dialog-data.interface';
import { AccountReactivationDialogComponent } from '../../../team/components/dialog/account-reactivation-dialog/account-reactivation-dialog.component';
import { AccountStatusService } from '../../../team/services/account-status.service';

@Component({
  selector: 'app-account-status',
  templateUrl: './account-status.component.html',
  styleUrls: ['./account-status.component.scss'],
})
export class AccountStatusComponent implements OnInit {
  @Input()
  user: User;

  @Input()
  showAction = false;

  @Output()
  userChange: EventEmitter<User> = new EventEmitter<User>();

  constructor(private dialog: MatDialog, private accountStatus: AccountStatusService) {}

  ngOnInit() {
    if (!this.user) {
      throw new TypeError("The input 'user' is required");
    }

    if (!(this.user instanceof User)) {
      throw new TypeError("The input 'user' must be an instance of User");
    }
  }

  openDeactivateDialog() {
    const deactivationReasons: AccountDeactivationReasonOption[] = [];

    if (this.user instanceof PatientUser) {
      deactivationReasons.push(
        ...enumValues(PatientDeactivationReason).map((key) => {
          return {
            reason: key,
            label: PatientDeactivationReasonLabels[key],
          };
        })
      );
    }

    if (this.user instanceof SpecialistUser) {
      deactivationReasons.push(
        ...enumValues(SpecialistDeactivationReason).map((key) => {
          return {
            reason: key,
            label: SpecialistDeactivationReasonLabels[key],
          };
        })
      );
    }

    if (this.user instanceof StaffUser) {
      deactivationReasons.push(
        ...enumValues(StaffDeactivationReason).map((key) => {
          return {
            reason: key,
            label: StaffDeactivationReasonLabels[key],
          };
        })
      );
    }

    const dialog = this.dialog.open(AccountDeactivationDialogComponent, {
      data: {
        user: this.user,
        deactivationReasons,
      } as AccountDeactivationDialogData,
    });

    dialog.afterClosed().subscribe((user: User) => this.updateUser(user));
  }

  openReactivateDialog() {
    this.accountStatus
      .openReactivateDialog(this.user)
      .afterClosed()
      .subscribe((user: User) => this.updateUser(user));
  }

  private updateUser(user?: User) {
    if (user) {
      this.user = user;
      this.userChange.emit(user);
    }
  }
}
