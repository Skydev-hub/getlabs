import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { applyNetworkValidationErrors, getFormFieldError, MarketEntity, MarketService, markFormAsTouched } from '@app/ui';
import { RegexValidator } from '../../../shared/validators/regex.validator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-market-details-form',
  templateUrl: './market-details-form.component.html',
  styleUrls: ['./market-details-form.component.scss'],
})
export class MarketDetailsFormComponent implements OnChanges {

  @Input()
  public market: MarketEntity;

  @Output()
  public save = new EventEmitter<MarketEntity>();

  public form: FormGroup;

  public req$: Subscription;

  constructor(
    private fb: FormBuilder,
    private service: MarketService,
  ) {
    this.form = fb.group({
      name: [null, Validators.required],
      code: [null, [Validators.required, RegexValidator(/^[0-9a-z]+$/i, 'alphanumeric')]],
      price: [null, Validators.required],
      isActive: [true],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(this.market || {});

    if (this.market instanceof MarketEntity && this.market.id) {
      // Code is not editable once a market is created
      this.form.get('code').disable();
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service.save({
        id: this.market ? this.market.id : undefined,
        name: model.name,
        code: model.code,
        price: Number(model.price) || 0,
        isActive: !!model.isActive,
      }).subscribe(
        market => this.save.emit(market),
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        },
      );
    }
  }

}
