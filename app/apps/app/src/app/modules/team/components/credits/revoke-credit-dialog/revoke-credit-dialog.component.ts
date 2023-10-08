import { Component, ViewChild } from '@angular/core';
import { AbstractCreditDialogComponent } from '../abstract-credit-dialog.component';
import { CreditComponent } from '../abstract-credit.component';
import { RevokeCreditComponent } from '../revoke-credit/revoke-credit.component';

@Component({
  templateUrl: './revoke-credit-dialog.component.html',
  styleUrls: ['./revoke-credit-dialog.component.scss'],
})
export class RevokeCreditDialogComponent extends AbstractCreditDialogComponent<void> {
  @ViewChild(RevokeCreditComponent, { static: true })
  private formComponent: RevokeCreditComponent;

  getFormComponent(): CreditComponent<void> {
    return this.formComponent;
  }
}
