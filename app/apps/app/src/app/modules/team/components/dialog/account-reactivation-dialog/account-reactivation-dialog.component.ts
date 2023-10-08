import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/ui';
import { Subscription } from 'rxjs';
import { AccountReactivationDialogData } from './account-reactivation-dialog-data.interface';


@Component({
  templateUrl: './account-reactivation-dialog.component.html',
  styleUrls: ['./account-reactivation-dialog.component.scss'],
})
export class AccountReactivationDialogComponent implements OnInit {

  public form: FormGroup;

  reqSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AccountReactivationDialogData,
    public dialogRef: MatDialogRef<AccountReactivationDialogComponent>,
    private service: UserService,
  ) {
  }

  ngOnInit(): void {
    if (!this.data.user) {
      throw new TypeError('The \'user\' data property is required');
    }
  }

  reactivate() {
    this.reqSub = this.service.getService(this.data.user.getUserType()).update(
      this.data.user.id,
      {
        deactivationDate: null,
      },
    ).subscribe(user => this.dialogRef.close(user));
  }

}
