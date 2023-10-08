import { Component, ViewChild } from '@angular/core';
import { CreditEntity } from '@app/ui';
import { CreditComponent } from '../abstract-credit.component';
import { IssueCreditComponent } from '../issue-credit/issue-credit.component';
import { AbstractCreditDialogComponent } from '../abstract-credit-dialog.component';

@Component({
  templateUrl: './issue-credit-dialog.component.html',
  styleUrls: ['./issue-credit-dialog.component.scss'],
})
export class IssueCreditDialogComponent extends AbstractCreditDialogComponent<CreditEntity> {
  @ViewChild(IssueCreditComponent, { static: true })
  private readonly formComponent: IssueCreditComponent;


  getFormComponent(): CreditComponent<CreditEntity> {
    return this.formComponent;
  }
}
