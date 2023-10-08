import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from '@app/ui';
import { AccountReactivationDialogData } from '../components/dialog/account-reactivation-dialog/account-reactivation-dialog-data.interface';
import { AccountReactivationDialogComponent } from '../components/dialog/account-reactivation-dialog/account-reactivation-dialog.component';

@Injectable()
export class AccountStatusService {
  constructor(private dialog: MatDialog) {}

  public openReactivateDialog(user: User) {
    return this.dialog.open(AccountReactivationDialogComponent, {
      data: { user } as AccountReactivationDialogData,
    });
  }
}
