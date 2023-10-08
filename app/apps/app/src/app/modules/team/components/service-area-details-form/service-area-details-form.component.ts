import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { applyNetworkValidationErrors, compareEntities, getFormFieldError, MarketEntity, MarketService, markFormAsTouched, ServiceAreaEntity, ServiceAreaService } from '@app/ui';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-team-service-area-details-form',
  templateUrl: './service-area-details-form.component.html',
  styleUrls: ['./service-area-details-form.component.scss'],
})
export class ServiceAreaDetailsFormComponent implements OnChanges {

  @Input()
  public serviceArea: ServiceAreaEntity;

  @Input()
  public market: MarketEntity;

  @Output()
  public save = new EventEmitter<ServiceAreaEntity>();

  public form: FormGroup;

  public markets$: Observable<MarketEntity[]>;

  public req$: Subscription;

  comparator = compareEntities;

  constructor(
    private fb: FormBuilder,
    private service: ServiceAreaService,
    private markets: MarketService,
  ) {
    this.form = fb.group({
      zipCode: [null, Validators.required],
      market: [null, Validators.required],
      active: [true],
    });

    this.markets$ = this.markets.list({ limit: '100' }).pipe(
      map(resp => resp.data),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue({
      ...this.serviceArea,
      market: this.serviceArea ? this.serviceArea.market : this.market,
    });

    if (this.serviceArea instanceof ServiceAreaEntity && this.serviceArea.id) {
      // Code is not editable once a market is created
      this.form.get('zipCode').disable();
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
        id: this.serviceArea ? this.serviceArea.id : undefined,
        zipCode: model.zipCode,
        market: model.market,
        active: !!model.active,
      }).subscribe(
        market => this.save.emit(market),
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        },
      );
    }
  }
}
