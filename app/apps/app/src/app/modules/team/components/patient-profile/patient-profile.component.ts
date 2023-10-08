import { Component, Input, OnInit, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreditEntity, File, PatientDeactivationReasonLabels, PatientUser } from '@app/ui';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { LightboxService } from '../../../shared/services/lightbox.service';
import { PatientCreditService } from '../../../shared/services/patient-credit.service';
import { IssueCreditDialogComponent } from '../credits/issue-credit-dialog/issue-credit-dialog.component';
import { RevokeCreditDialogComponent } from '../credits/revoke-credit-dialog/revoke-credit-dialog.component';
import { CreditDialogComponent, CreditDialogData } from '../credits/abstract-credit-dialog.component';

@Component({
  selector: 'app-team-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss'],
})
export class PatientProfileComponent implements OnInit {
  @Input()
  user: PatientUser;

  DeactivationReasonLabels = PatientDeactivationReasonLabels;

  constructor(
    private readonly lightbox: LightboxService,
    private readonly matDialog: MatDialog,
    private readonly toastrService: ToastrService,
    private readonly patientCreditService: PatientCreditService
  ) {}

  ngOnInit() {
    if (!(this.user instanceof PatientUser)) {
      throw new TypeError("The input 'user' must be an instance of PatientUser");
    }
  }

  preview(file: File) {
    this.lightbox.open(file);
  }

  openIssueCreditDialog() {
    this._openCreditDialog(IssueCreditDialogComponent).subscribe(() =>
      /* Display a success toast indicating the completion of the op */
      this.toastrService.success('Credit successfully added!')
    );
  }

  openRevokeCreditDialog() {
    this._openCreditDialog(RevokeCreditDialogComponent).subscribe(() =>
      /* Display a success toast indicating the completion of the op */
      this.toastrService.success('Credit successfully revoked!')
    );
  }

  private _openCreditDialog<T extends CreditDialogComponent<CreditEntity | void>>(creditDialog: Type<T>) {
    return this.matDialog
      .open<T, CreditDialogData>(creditDialog, {
        data: {
          recipient: this.user,
        },
      })
      .afterClosed()
      .pipe(
        /* A falsy result from the dialog indicates that no action should be taken. */
        filter(Boolean),

        /* Retrieve the updated balance */
        switchMap(() => this.patientCreditService.getBalance(this.user)),

        /* Update the local credit balance */
        tap((credits) => (this.user.credits = credits)),

        /* We intercept retrieval failures with the below block so we can display an according toast */
        catchError((err) => {
          this.toastrService.error('Credit operation completed successfully, but the updated credit balance could not be retrieved.');
          throw new Error(`Could not retrieve updated credit balance due to an exception returned by the API: ${JSON.stringify(err)}`);
        })
      );
  }
}
