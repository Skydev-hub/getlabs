import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { enumKeys, LabAccountEntity, LabCompany, MarketEntity, MarketService } from '@app/ui';
import { filter } from 'lodash-es';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-lab-account-list',
  templateUrl: './lab-account-list.component.html',
  styleUrls: ['./lab-account-list.component.scss'],
})
export class LabAccountListComponent implements OnInit {
  @Input()
  public market: MarketEntity;

  public form: FormGroup;

  public isEditing = false;

  public accountCodes$: Subscription;

  public req$: Subscription;

  constructor(private service: MarketService, private fb: FormBuilder) {
    this.form = fb.group({
      accountCodes: fb.array([]),
    });
  }

  get accountCodes(): FormArray {
    return this.form.get('accountCodes') as FormArray;
  }

  ngOnInit() {
    this.market.labAccountCodes = this.transformAccountCodes(this.market.labAccountCodes);
  }

  toggleEditMode(isEditing = !this.isEditing): void {
    if (isEditing) {
      this.fetchAccountCodes();
    }
    this.isEditing = isEditing;
  }

  fetchAccountCodes(): void {
    this.accountCodes.clear();
    for (const account of this.market.labAccountCodes) {
      if (account.company != null) {
        this.accountCodes.push(
          this.fb.group({
            accountNumber: account.accountNumber,
            company: account.company,
          })
        );
      }
    }
  }

  onSubmit(): void {
    this.market.labAccountCodes = this.accountCodes.value;
    this.req$ = this.service.update(this.market.id, this.market).subscribe((res) => {
      this.toggleEditMode(false);
    });
  }

  transformAccountCodes(accountCodes: LabAccountEntity[]): LabAccountEntity[] {
    const result: LabAccountEntity[] = [];
    enumKeys(LabCompany).forEach((key) => {
      const existing = filter(accountCodes, { company: LabCompany[key] });
      if (existing.length === 0) {
        result.push({ company: LabCompany[key], accountNumber: '' });
      } else {
        result.push(existing[0]);
      }
    });
    return result;
  }
}
