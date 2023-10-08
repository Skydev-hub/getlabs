import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { applyNetworkValidationErrors, MarketEntity, MarketService, markFormAsTouched } from '@app/ui';
import { Subscription } from 'rxjs';
import { FormGroupControl } from '../../../shared/types/form-group-control';


@Component({
  selector: 'app-team-market-schedule-form',
  templateUrl: './market-schedule-form.component.html',
  styleUrls: ['./market-schedule-form.component.scss'],
})
export class MarketScheduleFormComponent implements OnInit {

  @Input()
  public market: MarketEntity;

  @Output()
  public save = new EventEmitter<MarketEntity>();

  public form: FormGroup;

  req$: Subscription;

  constructor(
    private fb: FormBuilder,
    private service: MarketService,
  ) {
    this.form = fb.group({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
      blackouts: new FormGroupControl(),
    });
  }

  ngOnInit() {
    this.form.patchValue(this.market.schedule || {});
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service.update(this.market.id, {
        schedule: {
          monday: model.monday ? model.monday : undefined,
          tuesday: model.tuesday ? model.tuesday : undefined,
          wednesday: model.wednesday ? model.wednesday : undefined,
          thursday: model.thursday ? model.thursday : undefined,
          friday: model.friday ? model.friday : undefined,
          saturday: model.saturday ? model.saturday : undefined,
          sunday: model.sunday ? model.sunday : undefined,
          blackouts: model.blackouts ? model.blackouts : undefined,
        },
      }).subscribe(
        market => {
          this.save.emit(market);
        },
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        },
      );
    }
  }
}
